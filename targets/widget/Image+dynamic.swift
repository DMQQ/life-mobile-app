import SwiftUI
import Foundation
import UIKit

extension Image {
    static func dynamic(assetNameOrPath: String) -> Image {
        // Try to load as a local asset first
        if let _ = UIImage(named: assetNameOrPath) {
            return Image(assetNameOrPath)
        }
        
        // Try to load from shared container (for downloaded images)
        if let container = FileManager.default.containerURL(
            forSecurityApplicationGroupIdentifier: "group.expoLiveActivity.sharedData"
        ) {
            let fileURL = container.appendingPathComponent(assetNameOrPath)
            if let uiImage = UIImage(contentsOfFile: fileURL.path) {
                return Image(uiImage: uiImage)
            }
        }
        
        // Fallback to system image if nothing else works
        return Image(systemName: "photo")
    }
}

extension UIImage {
    static func dynamic(assetNameOrPath: String) -> UIImage? {
        // Try to load as a local asset first
        if let image = UIImage(named: assetNameOrPath) {
            return image
        }
        
        // Try to load from shared container (for downloaded images)
        if let container = FileManager.default.containerURL(
            forSecurityApplicationGroupIdentifier: "group.expoLiveActivity.sharedData"
        ) {
            let fileURL = container.appendingPathComponent(assetNameOrPath)
            if let image = UIImage(contentsOfFile: fileURL.path) {
                return image
            }
        }
        
        // Return nil if image cannot be loaded
        return nil
    }
}