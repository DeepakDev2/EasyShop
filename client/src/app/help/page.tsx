'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Search, CreditCard, Truck, RefreshCcw, HelpCircle, ChevronDown } from 'lucide-react'

type CategoryType = 'payments' | 'shipping' | 'returns' | 'faq'

interface FAQItem {
  id: number
  category: CategoryType
  q: string
  a: string
}

const FAQS: FAQItem[] = [
  {
    id: 1,
    category: 'payments',
    q: 'What payment methods do you support?',
    a: 'We support all major Credit Cards, Debit Cards, Net Banking, and UPI payments (PhonePe, GPay, Paytm). We also offer Cash on Delivery (COD) for most locations across India.'
  },
  {
    id: 2,
    category: 'payments',
    q: 'Is Cash on Delivery (COD) available for all pin codes?',
    a: 'COD is available for over 18,000 pin codes in India. If COD is not eligible for your specific pin code, you will be prompted to pay online during the address selection stage.'
  },
  {
    id: 3,
    category: 'payments',
    q: 'How long does a refund take to reflect in my bank account?',
    a: 'Refunds are initiated immediately upon cancellation or validation of return. For Cards and Net Banking, it typically takes 5-7 working days. For UPI, refunds reflect within 24-48 hours.'
  },
  {
    id: 4,
    category: 'shipping',
    q: 'What are the delivery timelines?',
    a: 'Standard shipping takes 3-5 business days depending on your location. Metro cities generally receive orders within 24-48 hours. Estimated delivery dates are shown during checkout.'
  },
  {
    id: 5,
    category: 'shipping',
    q: 'Are there any shipping charges?',
    a: 'We offer free delivery on all orders above ₹499! For orders below ₹499, a nominal flat shipping fee of ₹40 is applied at checkout.'
  },
  {
    id: 6,
    category: 'returns',
    q: 'What is your Return Policy?',
    a: 'We offer a hassle-free 10-day return policy for most categories (Electronics, Fashion, Home Decor). Items must be unused, in their original packaging, with price tags and brand boxes intact.'
  },
  {
    id: 7,
    category: 'returns',
    q: 'How do I cancel my order?',
    a: 'You can cancel your order at any time before it is shipped! Navigate to "My Orders", click on the specific order, and hit the "Cancel Order" button. Refund will be processed automatically.'
  },
  {
    id: 8,
    category: 'faq',
    q: 'How do I track my order?',
    a: 'Once shipped, you will receive a tracking link via email. You can also track your shipment live by visiting the "My Orders" tab in your account dashboard.'
  },
  {
    id: 9,
    category: 'faq',
    q: 'How can I contact EasyShop Customer Care?',
    a: 'You can reach our 24/7 dedicated helpline at 1800-208-9898 or write to us at support@easyshop.com. We average a response time of under 2 hours.'
  }
]

function HelpPortal() {
  const params = useSearchParams()
  const [activeCategory, setActiveCategory] = useState<CategoryType>('payments')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)

  useEffect(() => {
    const cat = params.get('cat') as CategoryType
    if (['payments', 'shipping', 'returns', 'faq'].includes(cat)) {
      setActiveCategory(cat)
    }
  }, [params])

  // Filter FAQs based on active category AND search query
  const filteredFaqs = FAQS.filter(faq => {
    const matchesSearch = faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    if (searchQuery.trim() !== '') {
      return matchesSearch
    }
    return faq.category === activeCategory && matchesSearch
  })

  const toggleAccordion = (id: number) => {
    setExpandedId(prev => (prev === id ? null : id))
  }

  return (
    <div className="min-h-screen bg-[#f1f3f6] flex flex-col justify-between">
      <div>
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          
          {/* Help Center Header & Search */}
          <div className="bg-[#2874f0] rounded-lg p-8 text-white mb-8 shadow-md text-center">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">EasyShop Support Center</h1>
            <p className="text-blue-100 text-xs sm:text-sm mb-6">We are here to help you. Search our FAQs or browse support categories below.</p>
            
            {/* Search Box */}
            <div className="max-w-xl mx-auto relative text-gray-700">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Type your question here (e.g. refund, shipping fee)..." 
                className="w-full pl-11 pr-4 py-3 bg-white rounded-full text-sm border-0 focus:ring-2 focus:ring-blue-500 shadow-inner outline-none"
              />
            </div>
          </div>

          {/* Categories Grid (hide if searching) */}
          {searchQuery.trim() === '' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <button 
                onClick={() => { setActiveCategory('payments'); setExpandedId(null) }}
                className={`card p-5 flex flex-col items-center gap-2 hover:border-[#2874f0] transition-colors border ${
                  activeCategory === 'payments' ? 'border-[#2874f0] bg-blue-50/50' : 'border-gray-200'
                }`}
              >
                <CreditCard className="text-[#2874f0]" size={24} />
                <span className="font-semibold text-sm text-gray-800">Payments &amp; Refunds</span>
              </button>
              <button 
                onClick={() => { setActiveCategory('shipping'); setExpandedId(null) }}
                className={`card p-5 flex flex-col items-center gap-2 hover:border-[#2874f0] transition-colors border ${
                  activeCategory === 'shipping' ? 'border-[#2874f0] bg-blue-50/50' : 'border-gray-200'
                }`}
              >
                <Truck className="text-[#2874f0]" size={24} />
                <span className="font-semibold text-sm text-gray-800">Shipping &amp; Delivery</span>
              </button>
              <button 
                onClick={() => { setActiveCategory('returns'); setExpandedId(null) }}
                className={`card p-5 flex flex-col items-center gap-2 hover:border-[#2874f0] transition-colors border ${
                  activeCategory === 'returns' ? 'border-[#2874f0] bg-blue-50/50' : 'border-gray-200'
                }`}
              >
                <RefreshCcw className="text-[#2874f0]" size={24} />
                <span className="font-semibold text-sm text-gray-800">Returns &amp; Cancellations</span>
              </button>
              <button 
                onClick={() => { setActiveCategory('faq'); setExpandedId(null) }}
                className={`card p-5 flex flex-col items-center gap-2 hover:border-[#2874f0] transition-colors border ${
                  activeCategory === 'faq' ? 'border-[#2874f0] bg-blue-50/50' : 'border-gray-200'
                }`}
              >
                <HelpCircle className="text-[#2874f0]" size={24} />
                <span className="font-semibold text-sm text-gray-800">General Help &amp; FAQs</span>
              </button>
            </div>
          )}

          {/* Heading */}
          <h2 className="font-bold text-gray-800 text-lg mb-4">
            {searchQuery.trim() !== '' ? `Search Results for "${searchQuery}"` : `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} FAQ`}
          </h2>

          {/* Accordion FAQ List */}
          <div className="space-y-3">
            {filteredFaqs.length === 0 ? (
              <div className="card text-center py-12 text-gray-500">
                🔍 No matches found for your search. Try adjusting terms!
              </div>
            ) : (
              filteredFaqs.map(faq => {
                const isOpen = expandedId === faq.id
                return (
                  <div key={faq.id} className="card border border-gray-200 overflow-hidden">
                    <button 
                      onClick={() => toggleAccordion(faq.id)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left font-bold text-gray-800 text-sm md:text-base hover:bg-gray-50 transition-colors"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
                    </button>
                    
                    {/* Animated Collapsible Panel */}
                    <div className={`transition-all duration-300 ease-in-out ${
                      isOpen ? 'max-h-40 border-t border-gray-100 bg-gray-50/50' : 'max-h-0'
                    } overflow-hidden`}>
                      <div className="p-5 text-sm text-gray-600 leading-relaxed">
                        {faq.a}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

        </main>
      </div>
      <Footer />
    </div>
  )
}

export default function HelpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f1f3f6] flex flex-col justify-between" />}>
      <HelpPortal />
    </Suspense>
  )
}
