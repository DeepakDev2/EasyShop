import Link from 'next/link'
import { Mail, Phone } from 'lucide-react'

const SOCIAL = [
  { icon: '𝕏', label: 'Twitter', href: '#' },
  { icon: '📘', label: 'Facebook', href: '#' },
  { icon: '📸', label: 'Instagram', href: '#' },
  { icon: '▶️', label: 'YouTube', href: '#' },
]

const FOOTER_LINKS = {
  'About EasyShop': [
    { label: 'About Us', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Press', href: '#' },
    { label: 'Corporate Information', href: '#' },
  ],
  'Help': [
    { label: 'Payments', href: '#' },
    { label: 'Shipping', href: '#' },
    { label: 'Cancellation & Returns', href: '#' },
    { label: 'FAQ', href: '#' },
  ],
  'Policy': [
    { label: 'Return Policy', href: '#' },
    { label: 'Terms Of Use', href: '#' },
    { label: 'Security', href: '#' },
    { label: 'Privacy', href: '#' },
  ],
  'Social': [
    { label: 'Facebook', href: '#' },
    { label: 'Twitter', href: '#' },
    { label: 'YouTube', href: '#' },
    { label: 'Instagram', href: '#' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-[#172337] text-gray-300 mt-8">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex flex-col leading-none mb-3">
              <span className="text-white font-bold text-xl">EasyShop</span>
              <span className="text-[#FFE500] text-xs italic">Explore Plus ✦</span>
            </Link>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              India's trusted online shopping destination. Best deals on electronics, fashion, home & more.
            </p>
            <div className="flex gap-3 mt-3">
              {SOCIAL.map(s => (
                <a key={s.label} href={s.href} aria-label={s.label}
                  className="text-gray-400 hover:text-white transition-colors text-lg">{s.icon}</a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-white font-semibold text-sm uppercase tracking-wide mb-3">{title}</h3>
              <ul className="space-y-2">
                {links.map(link => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-xs text-gray-400 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">© 2026 EasyShop Private Limited. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Mail size={12} /> support@easyshop.com</span>
            <span className="flex items-center gap-1"><Phone size={12} /> 1800-208-9898</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
