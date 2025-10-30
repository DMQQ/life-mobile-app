import Foundation
import UIKit
import os.log

private let logger = Logger(subsystem: "com.expoLiveActivity", category: "ImageResolution")

enum ImageResolutionError: Error {
  case invalidURL
  case downloadFailed(Error)
  case invalidImageData
  case containerUnavailable
  case fileSizeExceeded
  case unsupportedFormat
}

func resolveImage(from string: String, maxRetries: Int = 3) async throws -> String {
  logger.info("🔍 resolveImage called with: \(string)")
  
  // For local assets, return immediately - no need for async processing
  if !string.hasPrefix("http") {
    logger.info("✅ Local asset detected, returning as-is: \(string)")
    return string
  }
  
  guard let url = URL(string: string), url.scheme?.hasPrefix("http") == true else {
    throw ImageResolutionError.invalidURL
  }
  
  guard let container = FileManager.default.containerURL(
    forSecurityApplicationGroupIdentifier: "group.com.dmq.mylifemobile"
  ) else {
    throw ImageResolutionError.containerUnavailable
  }
  
  // Try download with retry mechanism
  var lastError: Error?
  for attempt in 1...maxRetries {
    do {
      let data = try await Data.download(from: url)
      
      // Validate image data and size (max 2MB)
      guard data.count <= 2 * 1024 * 1024 else {
        throw ImageResolutionError.fileSizeExceeded
      }
      
      // Validate that data represents a valid image
      guard UIImage(data: data) != nil else {
        throw ImageResolutionError.invalidImageData
      }
      
      // Determine file extension from URL or default to png
      let pathExtension = url.pathExtension.isEmpty ? "png" : url.pathExtension
      let filename = UUID().uuidString + "." + pathExtension
      let fileURL = container.appendingPathComponent(filename)
      
      try data.write(to: fileURL)
      
      // Clean up old files to prevent storage bloat
      cleanupOldImages(in: container)
      
      return fileURL.lastPathComponent
    } catch {
      lastError = error
      if attempt < maxRetries {
        // Wait before retry (exponential backoff)
        try await Task.sleep(nanoseconds: UInt64(pow(2.0, Double(attempt)) * 1_000_000_000))
      }
    }
  }
  
  throw ImageResolutionError.downloadFailed(lastError ?? NSError(domain: "Unknown", code: -1))
}

func copyAppIconToSharedContainer() -> String? {
  guard let container = FileManager.default.containerURL(
    forSecurityApplicationGroupIdentifier: "group.com.dmq.mylifemobile"
  ) else {
    return nil
  }
  
  // Load original icon and resize at runtime (works reliably)
  let iconPath = Bundle.main.path(forResource: "icon", ofType: "png", inDirectory: "icon.icon/Assets")
  let rawImage: UIImage? = {
    if let iconPath = iconPath {
      return UIImage(contentsOfFile: iconPath)
    }
    return UIImage(named: "SplashScreenLogo")
  }()
  
  guard let rawImage = rawImage else { return nil }
  
  // Resize to 36x36 for Dynamic Island
  let targetSize = CGSize(width: 36, height: 36)
  UIGraphicsBeginImageContextWithOptions(targetSize, false, 0.0)
  rawImage.draw(in: CGRect(origin: .zero, size: targetSize))
  let appIconImage = UIGraphicsGetImageFromCurrentImageContext()
  UIGraphicsEndImageContext()
  
  guard let appIconImage = appIconImage,
        let imageData = appIconImage.pngData() else { return nil }
  
  let filename = "app-icon.png"
  let fileURL = container.appendingPathComponent(filename)
  
  do {
    try imageData.write(to: fileURL)
    return filename
  } catch {
    return nil
  }
}

private func cleanupOldImages(in container: URL) {
  DispatchQueue.global(qos: .utility).async {
    do {
      let fileManager = FileManager.default
      let contents = try fileManager.contentsOfDirectory(at: container, includingPropertiesForKeys: [.creationDateKey], options: .skipsHiddenFiles)
      
      // Keep only files created in the last 24 hours
      let cutoffDate = Date().addingTimeInterval(-24 * 60 * 60)
      
      for fileURL in contents {
        if let creationDate = try fileURL.resourceValues(forKeys: [.creationDateKey]).creationDate,
           creationDate < cutoffDate {
          try fileManager.removeItem(at: fileURL)
        }
      }
    } catch {
      logger.error("Failed to cleanup old images: \(error.localizedDescription)")
    }
  }
}