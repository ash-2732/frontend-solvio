"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getRoleColorClasses } from "@/utils/roleColors";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Leaf
} from "lucide-react";

export default function Footer() {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();

  const roleColors = getRoleColorClasses(user?.user_type);

  const colors = {
    bgGradient: roleColors.bgGradient,
    iconColor: roleColors.iconColor,
    textColor: roleColors.textLight,
    borderColor: roleColors.border,
    footerText: roleColors.textMuted,
    hoverColor: roleColors.primaryHover
  };

  return (
    <footer className={`${colors.bgGradient} text-white`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Leaf className={`w-8 h-8 ${colors.iconColor}`} />
              <span className="text-2xl font-bold">ZeroBin</span>
            </div>
            <p className={`${colors.textColor} text-sm leading-relaxed`}>
              Smart Waste Management System for a cleaner, greener tomorrow. Join us in making the world a better place.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`${colors.hoverColor} transition-colors duration-200`}
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`${colors.hoverColor} transition-colors duration-200`}
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`${colors.hoverColor} transition-colors duration-200`}
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`${colors.hoverColor} transition-colors duration-200`}
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className={`${colors.textColor} hover:text-white transition-colors duration-200 text-sm`}>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className={`${colors.textColor} hover:text-white transition-colors duration-200 text-sm`}>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/services" className={`${colors.textColor} hover:text-white transition-colors duration-200 text-sm`}>
                  Services
                </Link>
              </li>
              <li>
                <Link href="/contact" className={`${colors.textColor} hover:text-white transition-colors duration-200 text-sm`}>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className={`${colors.textColor} hover:text-white transition-colors duration-200 text-sm`}>
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/faq" className={`${colors.textColor} hover:text-white transition-colors duration-200 text-sm`}>
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className={`${colors.textColor} hover:text-white transition-colors duration-200 text-sm`}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className={`${colors.textColor} hover:text-white transition-colors duration-200 text-sm`}>
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className={`w-5 h-5 ${colors.iconColor} flex-shrink-0 mt-0.5`} />
                <span className={`${colors.textColor} text-sm`}>
                  123 Green Street<br />Dhaka, Bangladesh
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className={`w-5 h-5 ${colors.iconColor} flex-shrink-0`} />
                <span className={`${colors.textColor} text-sm`}>
                  +880 1234-567890
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className={`w-5 h-5 ${colors.iconColor} flex-shrink-0`} />
                <span className={`${colors.textColor} text-sm`}>
                  info@zerobin.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`border-t ${colors.borderColor} pt-8`}>
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className={`${colors.footerText} text-sm`}>
              © {currentYear} ZeroBin. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="/privacy" className={`${colors.footerText} hover:text-white transition-colors duration-200 text-sm`}>
                Privacy
              </Link>
              <Link href="/terms" className={`${colors.footerText} hover:text-white transition-colors duration-200 text-sm`}>
                Terms
              </Link>
              <Link href="/cookies" className={`${colors.footerText} hover:text-white transition-colors duration-200 text-sm`}>
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
