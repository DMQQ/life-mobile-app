
import ActivityKit
import ExpoModulesCore
import os.log

public class ExpoLiveActivityModule: Module {
  private let logger = Logger(subsystem: "com.expoLiveActivity", category: "Module")
  struct LiveActivityState: Record {
    @Field
    var title: String

    @Field
    var subtitle: String?

    @Field
    var progressBar: ProgressBar?

    struct ProgressBar: Record {
      @Field
      var date: Double?

      @Field
      var progress: Double?
    }

    @Field
    var imageName: String?

    @Field
    var dynamicIslandImageName: String?
  }

  struct LiveActivityConfig: Record {
    @Field
    var backgroundColor: String?

    @Field
    var titleColor: String?

    @Field
    var subtitleColor: String?

    @Field
    var progressViewTint: String?

    @Field
    var progressViewLabelColor: String?

    @Field
    var deepLinkUrl: String?

    @Field
    var timerType: DynamicIslandTimerType?

    @Field
    var padding: Int?

    @Field
    var paddingDetails: PaddingDetails?

    @Field
    var imagePosition: String?

    @Field
    var imageWidth: Int?

    @Field
    var imageHeight: Int?

    @Field
    var imageWidthPercent: Double?

    @Field
    var imageHeightPercent: Double?

    @Field
    var imageAlign: String?

    @Field
    var contentFit: String?

    struct PaddingDetails: Record {
      @Field var top: Int?
      @Field var bottom: Int?
      @Field var left: Int?
      @Field var right: Int?
      @Field var vertical: Int?
      @Field var horizontal: Int?
    }
  }

  enum DynamicIslandTimerType: String, Enumerable {
    case circular
    case digital
  }

  @available(iOS 16.1, *)
  private func sendPushToken(activity: Activity<LiveActivityAttributes>, activityPushToken: String) {
    sendEvent(
      "onTokenReceived",
      [
        "activityID": activity.id,
        "activityName": activity.attributes.name,
        "activityPushToken": activityPushToken,
      ]
    )
  }

  private func sendPushToStartToken(activityPushToStartToken: String) {
    sendEvent(
      "onPushToStartTokenReceived",
      [
        "activityPushToStartToken": activityPushToStartToken,
      ]
    )
  }

  @available(iOS 16.1, *)
  private func sendStateChange(
    activity: Activity<LiveActivityAttributes>, activityState: ActivityState
  ) {
    sendEvent(
      "onStateChange",
      [
        "activityID": activity.id,
        "activityName": activity.attributes.name,
        "activityState": String(describing: activityState),
      ]
    )
  }

  private func updateImages(
    state: LiveActivityState, newState: inout LiveActivityAttributes.ContentState
  ) async throws {
    if let name = state.imageName {
      newState.imageName = try await resolveImage(from: name)
    }

    if let name = state.dynamicIslandImageName {
      newState.dynamicIslandImageName = try await resolveImage(from: name)
    }
  }
  
  private func resolveImagesForState(_ state: LiveActivityState) async -> (imageName: String?, dynamicIslandImageName: String?) {
    var resolvedImageName: String?
    var resolvedDynamicIslandImageName: String?
    
    // Special handling for app icons - copy to shared container
    if state.imageName == "AppIcon" || state.imageName == "SplashScreenLogo" || state.imageName == "icon" {
      resolvedImageName = copyAppIconToSharedContainer()
    }
    
    if state.dynamicIslandImageName == "AppIcon" || state.dynamicIslandImageName == "SplashScreenLogo" || state.dynamicIslandImageName == "icon" {
      resolvedDynamicIslandImageName = copyAppIconToSharedContainer()
    }
    
    // Resolve remote images concurrently
    async let imageNameTask: String? = {
      if let name = state.imageName, name != "AppIcon" && name != "SplashScreenLogo" && name != "icon" {
        do {
          return try await resolveImage(from: name)
        } catch {
          return nil
        }
      }
      return nil
    }()
    
    async let dynamicIslandImageNameTask: String? = {
      if let name = state.dynamicIslandImageName, name != "AppIcon" && name != "SplashScreenLogo" && name != "icon" {
        do {
          return try await resolveImage(from: name)
        } catch {
          return nil
        }
      }
      return nil
    }()
    
    // Use resolved values from async tasks if app icon wasn't handled above
    if resolvedImageName == nil {
      resolvedImageName = await imageNameTask
    }
    if resolvedDynamicIslandImageName == nil {
      resolvedDynamicIslandImageName = await dynamicIslandImageNameTask
    }
    
    return (resolvedImageName, resolvedDynamicIslandImageName)
  }

  private func observePushToStartToken() {
    guard #available(iOS 17.2, *), ActivityAuthorizationInfo().areActivitiesEnabled else { return }

    logger.info("Observing push to start token updates...")
    Task {
      for await data in Activity<LiveActivityAttributes>.pushToStartTokenUpdates {
        let token = data.reduce("") { $0 + String(format: "%02x", $1) }
        sendPushToStartToken(activityPushToStartToken: token)
      }
    }
  }

  private func observeLiveActivityUpdates() {
    guard #available(iOS 16.2, *) else { return }

    Task {
      for await activityUpdate in Activity<LiveActivityAttributes>.activityUpdates {
        let activityId = activityUpdate.id
        let activityState = activityUpdate.activityState

        logger.info("Received activity update: \(activityId), \(String(describing: activityState))")

        guard
          let activity = Activity<LiveActivityAttributes>.activities.first(where: {
            $0.id == activityId
          })
        else { 
          logger.warning("Didn't find activity with ID \(activityId)")
          return 
        }

        if case .active = activityState {
          Task {
            for await state in activity.activityStateUpdates {
              sendStateChange(activity: activity, activityState: state)
            }
          }

          if pushNotificationsEnabled {
            logger.info("Adding push token observer for activity \(activity.id)")
            Task {
              for await pushToken in activity.pushTokenUpdates {
                let pushTokenString = pushToken.reduce("") { $0 + String(format: "%02x", $1) }

                sendPushToken(activity: activity, activityPushToken: pushTokenString)
              }
            }
          }
        }
      }
    }
  }

  private var pushNotificationsEnabled: Bool {
    Bundle.main.object(forInfoDictionaryKey: "ExpoLiveActivity_EnablePushNotifications") as? Bool
      ?? false
  }

  public func definition() -> ModuleDefinition {
    Name("ExpoLiveActivity")

    OnCreate {
      if pushNotificationsEnabled {
        observePushToStartToken()
      }
      observeLiveActivityUpdates()
    }

    Events("onTokenReceived", "onPushToStartTokenReceived", "onStateChange")

    AsyncFunction("startActivity") {
      (state: LiveActivityState, maybeConfig: LiveActivityConfig?) -> String in
      guard #available(iOS 16.2, *) else { throw UnsupportedOSException("16.2") }

      guard ActivityAuthorizationInfo().areActivitiesEnabled else {
        throw LiveActivitiesNotEnabledException()
      }

      do {
        let config = maybeConfig ?? LiveActivityConfig()

        let attributes = LiveActivityAttributes(
          name: "ExpoLiveActivity",
          backgroundColor: config.backgroundColor,
          titleColor: config.titleColor,
          subtitleColor: config.subtitleColor,
          progressViewTint: config.progressViewTint,
          progressViewLabelColor: config.progressViewLabelColor,
          deepLinkUrl: config.deepLinkUrl,
          timerType: config.timerType == .digital ? .digital : .circular,
          padding: config.padding,
          paddingDetails: config.paddingDetails.map {
            LiveActivityAttributes.PaddingDetails(
              top: $0.top,
              bottom: $0.bottom,
              left: $0.left,
              right: $0.right,
              vertical: $0.vertical,
              horizontal: $0.horizontal
            )
          },
          imagePosition: config.imagePosition,
          imageWidth: config.imageWidth,
          imageHeight: config.imageHeight,
          imageWidthPercent: config.imageWidthPercent,
          imageHeightPercent: config.imageHeightPercent,
          imageAlign: config.imageAlign,
          contentFit: config.contentFit
        )

        // Resolve images before starting activity
        let resolvedImages = await resolveImagesForState(state)
        
        let finalImageName = resolvedImages.imageName ?? state.imageName
        let finalDynamicIslandImageName = resolvedImages.dynamicIslandImageName ?? state.dynamicIslandImageName
        
        
        let initialState = LiveActivityAttributes.ContentState(
          title: state.title,
          subtitle: state.subtitle,
          timerEndDateInMilliseconds: state.progressBar?.date,
          progress: state.progressBar?.progress,
          imageName: finalImageName,
          dynamicIslandImageName: finalDynamicIslandImageName
        )

        let activity = try Activity.request(
          attributes: attributes,
          content: .init(state: initialState, staleDate: nil),
          pushType: pushNotificationsEnabled ? .token : nil
        )

        // Only update for remote images that might have failed initial resolution
        if (state.imageName?.hasPrefix("http") == true && resolvedImages.imageName == nil) ||
           (state.dynamicIslandImageName?.hasPrefix("http") == true && resolvedImages.dynamicIslandImageName == nil) {
          Task {
            var newState = activity.content.state
            try await updateImages(state: state, newState: &newState)
            await activity.update(ActivityContent(state: newState, staleDate: nil))
          }
        }

        return activity.id
      } catch {
        throw UnexpectedErrorException(error)
      }
    }

    Function("stopActivity") { (activityId: String, state: LiveActivityState) in
      guard #available(iOS 16.2, *) else { throw UnsupportedOSException("16.2") }

      guard
        let activity = Activity<LiveActivityAttributes>.activities.first(where: {
          $0.id == activityId
        })
      else { throw ActivityNotFoundException(activityId) }

      Task {
        logger.info("Stopping activity with id: \(activityId)")
        var newState = LiveActivityAttributes.ContentState(
          title: state.title,
          subtitle: state.subtitle,
          timerEndDateInMilliseconds: state.progressBar?.date,
          progress: state.progressBar?.progress
        )
        try await updateImages(state: state, newState: &newState)
        await activity.end(
          ActivityContent(state: newState, staleDate: nil),
          dismissalPolicy: .immediate
        )
      }
    }

    Function("updateActivity") { (activityId: String, state: LiveActivityState) in
      guard #available(iOS 16.2, *) else {
        throw UnsupportedOSException("16.2")
      }

      guard
        let activity = Activity<LiveActivityAttributes>.activities.first(where: {
          $0.id == activityId
        })
      else { throw ActivityNotFoundException(activityId) }

      Task {
        logger.info("Updating activity with id: \(activityId)")
        var newState = LiveActivityAttributes.ContentState(
          title: state.title,
          subtitle: state.subtitle,
          timerEndDateInMilliseconds: state.progressBar?.date,
          progress: state.progressBar?.progress
        )
        try await updateImages(state: state, newState: &newState)
        await activity.update(ActivityContent(state: newState, staleDate: nil))
      }
    }
  }
}