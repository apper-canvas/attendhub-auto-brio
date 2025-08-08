import React from "react"
import { cn } from "@/utils/cn"

const Badge = React.forwardRef(({ className, variant = "default", children, ...props }, ref) => {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    present: "bg-gradient-to-r from-success-500 to-green-600 text-white",
    absent: "bg-gradient-to-r from-error-500 to-red-600 text-white",
    late: "bg-gradient-to-r from-warning-500 to-yellow-600 text-white",
    excused: "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
  }

  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})

Badge.displayName = "Badge"

export default Badge