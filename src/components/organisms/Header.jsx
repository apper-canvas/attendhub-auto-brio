import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import Button from "@/components/atoms/Button"
import ApperIcon from "@/components/ApperIcon"

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  const navigation = [
    { name: "Dashboard", href: "/", icon: "Home" },
    { name: "Sessions", href: "/sessions", icon: "Calendar" },
    { name: "Participants", href: "/participants", icon: "Users" },
    { name: "Reports", href: "/reports", icon: "BarChart3" }
  ]

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true
    if (path !== "/" && location.pathname.startsWith(path)) return true
    return false
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="bg-gradient-to-r from-primary-500 to-purple-500 p-2 rounded-lg">
              <ApperIcon name="ClipboardCheck" className="h-6 w-6 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              AttendHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-all duration-200 ${
                  isActive(item.href)
                    ? "text-primary-600 border-b-2 border-primary-500"
                    : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300"
                }`}
              >
                <ApperIcon name={item.icon} size={16} className="mr-2" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Quick Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="primary" size="sm">
              <ApperIcon name="Plus" size={16} className="mr-1" />
              New Session
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <ApperIcon name={isMobileMenuOpen ? "X" : "Menu"} size={20} />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-sm">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                  isActive(item.href)
                    ? "bg-gradient-to-r from-primary-50 to-purple-50 text-primary-600"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <ApperIcon name={item.icon} size={16} className="mr-3" />
                  {item.name}
                </div>
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-200">
              <Button variant="primary" className="w-full">
                <ApperIcon name="Plus" size={16} className="mr-1" />
                New Session
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header