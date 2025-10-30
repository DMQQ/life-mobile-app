import SwiftUI
import Foundation
import UIKit
import os.log

private let logger = Logger(subsystem: "com.expoLiveActivity", category: "ImageLoading")

extension Image {
    static func dynamic(assetNameOrPath: String) -> Image {
        // Try to load as a local asset first
        if let _ = UIImage(named: assetNameOrPath) {
            logger.debug("✅ Loaded local asset: \(assetNameOrPath)")
            return Image(assetNameOrPath)
        }
        
        // Try common app icon variants if original asset name fails
        let iconVariants = [
            assetNameOrPath,
            "AppIcon",
            "icon",
            "app-icon",
            "Icon"
        ]
        
        for variant in iconVariants where variant != assetNameOrPath {
            if let _ = UIImage(named: variant) {
                logger.debug("✅ Loaded icon variant: \(variant) for requested: \(assetNameOrPath)")
                return Image(variant)
            }
        }
        
        // Try to load from shared container (for downloaded images)
        if let container = FileManager.default.containerURL(
            forSecurityApplicationGroupIdentifier: "group.com.dmq.mylifemobile"
        ) {
            let fileURL = container.appendingPathComponent(assetNameOrPath)
            if let uiImage = UIImage(contentsOfFile: fileURL.path) {
                logger.debug("✅ Loaded from shared container: \(assetNameOrPath)")
                return Image(uiImage: uiImage)
            } else {
                logger.warning("⚠️ Failed to load from shared container: \(fileURL.path)")
            }
        }
        
        logger.error("❌ Fallback to system image for: \(assetNameOrPath)")
        
        // Fallback to system image if nothing else works
        return Image(systemName: "photo")
    }
}

extension UIImage {
    static func dynamic(assetNameOrPath: String) -> UIImage? {
        // Try to load as a local asset first
        if let image = UIImage(named: assetNameOrPath) {
            logger.debug("✅ UIImage loaded local asset: \(assetNameOrPath)")
            return image
        }
        
        // Try common app icon variants if original asset name fails
        let iconVariants = [
            assetNameOrPath,
            "AppIcon",
            "icon", 
            "app-icon",
            "Icon"
        ]
        
        for variant in iconVariants where variant != assetNameOrPath {
            if let image = UIImage(named: variant) {
                logger.debug("✅ UIImage loaded icon variant: \(variant) for requested: \(assetNameOrPath)")
                return image
            }
        }
        
        // Try to load from shared container (for downloaded images)
        if let container = FileManager.default.containerURL(
            forSecurityApplicationGroupIdentifier: "group.com.dmq.mylifemobile"
        ) {
            let fileURL = container.appendingPathComponent(assetNameOrPath)
            if let image = UIImage(contentsOfFile: fileURL.path) {
                logger.debug("✅ UIImage loaded from shared container: \(assetNameOrPath)")
                return image
            } else {
                logger.warning("⚠️ UIImage failed to load from shared container: \(fileURL.path)")
            }
        }
        
        logger.error("❌ UIImage could not load image: \(assetNameOrPath)")
        
        // Return nil if image cannot be loaded
        return nil
    }
}