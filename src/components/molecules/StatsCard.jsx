import Card from "@/components/atoms/Card"
import ApperIcon from "@/components/ApperIcon"
import { cn } from "@/utils/cn"

const StatsCard = ({ title, value, icon, color = "primary", change, changeType = "positive" }) => {
  const colorClasses = {
    primary: "text-primary-600 bg-primary-50",
    success: "text-success-500 bg-green-50",
    warning: "text-warning-500 bg-yellow-50",
    error: "text-error-500 bg-red-50"
  }

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 hover:from-white hover:to-blue-50 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {value}
          </p>
          {change && (
            <p className={cn(
              "text-sm flex items-center mt-1",
              changeType === "positive" ? "text-success-500" : "text-error-500"
            )}>
              <ApperIcon 
                name={changeType === "positive" ? "TrendingUp" : "TrendingDown"} 
                size={14} 
                className="mr-1" 
              />
              {change}
            </p>
          )}
        </div>
        <div className={cn(
          "p-3 rounded-full",
          colorClasses[color]
        )}>
          <ApperIcon name={icon} size={24} />
        </div>
      </div>
    </Card>
  )
}

export default StatsCard