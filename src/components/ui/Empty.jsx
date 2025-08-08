import Button from "@/components/atoms/Button"
import ApperIcon from "@/components/ApperIcon"

const Empty = ({ 
  message = "No data found", 
  description = "Get started by creating your first item",
  actionLabel = "Get Started",
  onAction,
  icon = "Inbox"
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-8 rounded-full mb-6">
        <ApperIcon name={icon} size={48} className="text-gray-400" />
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 mb-2">{message}</h3>
      <p className="text-gray-600 mb-6 max-w-md">{description}</p>
      
      {onAction && (
        <Button variant="primary" onClick={onAction} className="flex items-center">
          <ApperIcon name="Plus" size={16} className="mr-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export default Empty