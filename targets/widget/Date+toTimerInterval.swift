import Foundation

extension Date {
    static func toTimerInterval(miliseconds: Double) -> ClosedRange<Date> {
        let endDate = Date(timeIntervalSince1970: miliseconds / 1000)
        let startDate = Date()
        return startDate...endDate
    }
}