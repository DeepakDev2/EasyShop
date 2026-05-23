'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Building2, Briefcase, Newspaper, ShieldAlert, Award, Compass, Heart } from 'lucide-react'
import toast from 'react-hot-toast'

type TabType = 'about' | 'careers' | 'press' | 'corporate'

function AboutPortal() {
  const params = useSearchParams()
  const [activeTab, setActiveTab] = useState<TabType>('about')

  useEffect(() => {
    const t = params.get('tab') as TabType
    if (['about', 'careers', 'press', 'corporate'].includes(t)) {
      setActiveTab(t)
    }
  }, [params])

  // Job Application Modal State
  const [selectedJob, setSelectedJob] = useState<string | null>(null)
  const [applyForm, setApplyForm] = useState({ name: '', email: '', resume: '' })

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success(`Application for ${selectedJob} submitted successfully! 🚀`)
    setSelectedJob(null)
    setApplyForm({ name: '', email: '', resume: '' })
  }

  const jobs = [
    { title: 'Senior Frontend Engineer (Next.js / React)', dept: 'Engineering', loc: 'Bengaluru, KA (Hybrid)', exp: '4-7 Years' },
    { title: 'UX/UI Product Designer', dept: 'Design', loc: 'Remote', exp: '2-5 Years' },
    { title: 'Category Manager (Consumer Electronics)', dept: 'Business Development', loc: 'Mumbai, MH (Onsite)', exp: '3-6 Years' },
    { title: 'Customer Success Representative', dept: 'Operations', loc: 'Delhi NCR (Onsite)', exp: '0-2 Years' },
  ]

  const pressReleases = [
    { date: 'May 12, 2026', title: 'EasyShop secures $45M Series C Funding to power next-gen logistics networks across Tier 2 & 3 cities.', link: '#' },
    { date: 'April 05, 2026', title: 'EasyShop announces zero-carbon emissions delivery pilot in major metropolitan zones.', link: '#' },
    { date: 'March 18, 2026', title: 'EasyShop partners with local artisans and handloom communities to expand "Artisanal India" category.', link: '#' },
  ]

  return (
    <div className="min-h-screen bg-[#f1f3f6] flex flex-col justify-between">
      <div>
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-8">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#2874f0] to-[#1253c4] rounded-lg p-8 text-white mb-8 shadow-md">
            <h1 className="text-3xl font-bold mb-2">About EasyShop</h1>
            <p className="text-blue-100 text-sm md:text-base max-w-2xl">
              Learn more about our vision, explore job openings, check out corporate developments, or review registered company details.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar Tabs Navigation */}
            <aside className="w-full md:w-64 shrink-0">
              <nav className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-3 md:pb-0 bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                <button onClick={() => setActiveTab('about')}
                  className={`flex items-center gap-2.5 px-4 py-3 text-sm font-semibold rounded transition-colors text-left whitespace-nowrap w-full ${
                    activeTab === 'about' ? 'bg-blue-50 text-[#2874f0]' : 'text-gray-600 hover:bg-gray-50'
                  }`}>
                  <Building2 size={16} /> About Us
                </button>
                <button onClick={() => setActiveTab('careers')}
                  className={`flex items-center gap-2.5 px-4 py-3 text-sm font-semibold rounded transition-colors text-left whitespace-nowrap w-full ${
                    activeTab === 'careers' ? 'bg-blue-50 text-[#2874f0]' : 'text-gray-600 hover:bg-gray-50'
                  }`}>
                  <Briefcase size={16} /> Careers / Jobs
                </button>
                <button onClick={() => setActiveTab('press')}
                  className={`flex items-center gap-2.5 px-4 py-3 text-sm font-semibold rounded transition-colors text-left whitespace-nowrap w-full ${
                    activeTab === 'press' ? 'bg-blue-50 text-[#2874f0]' : 'text-gray-600 hover:bg-gray-50'
                  }`}>
                  <Newspaper size={16} /> Press &amp; Media
                </button>
                <button onClick={() => setActiveTab('corporate')}
                  className={`flex items-center gap-2.5 px-4 py-3 text-sm font-semibold rounded transition-colors text-left whitespace-nowrap w-full ${
                    activeTab === 'corporate' ? 'bg-blue-50 text-[#2874f0]' : 'text-gray-600 hover:bg-gray-50'
                  }`}>
                  <ShieldAlert size={16} /> Corporate Info
                </button>
              </nav>
            </aside>

            {/* Main Content Area */}
            <section className="flex-1 bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-100 min-h-[400px]">
              
              {/* Tab: About Us */}
              {activeTab === 'about' && (
                <div className="space-y-6 animate-fadeIn">
                  <h2 className="text-xl font-bold text-gray-800 border-b pb-3 flex items-center gap-2">
                    <Compass className="text-[#2874f0]" size={20} /> Who We Are
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    EasyShop is India's leading digital marketplace. Established in 2022, our goal has been to democratize online shopping by providing unparalleled selection, competitive pricing, and swift logistical delivery. 
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    With millions of active buyers, thousands of sellers, and an extensive distribution network, we empower local merchant economies while delivering premium experiences directly to consumer doorsteps.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                    <div className="p-4 border border-gray-100 bg-gray-50 rounded text-center">
                      <Award className="text-[#2874f0] mx-auto mb-2" size={24} />
                      <div className="font-bold text-gray-800 text-sm">Customer First</div>
                      <p className="text-xs text-gray-500 mt-1">We optimize every decision for customer convenience and support.</p>
                    </div>
                    <div className="p-4 border border-gray-100 bg-gray-50 rounded text-center">
                      <Compass className="text-[#2874f0] mx-auto mb-2" size={24} />
                      <div className="font-bold text-gray-800 text-sm">Empower Local</div>
                      <p className="text-xs text-gray-500 mt-1">We enable home-grown merchants and startups to reach national markets.</p>
                    </div>
                    <div className="p-4 border border-gray-100 bg-gray-50 rounded text-center">
                      <Heart className="text-[#2874f0] mx-auto mb-2" size={24} />
                      <div className="font-bold text-gray-800 text-sm">Integrity &amp; Trust</div>
                      <p className="text-xs text-gray-500 mt-1">Ethical principles are rooted inside our product and supply chains.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Careers */}
              {activeTab === 'careers' && (
                <div className="space-y-6 animate-fadeIn">
                  <h2 className="text-xl font-bold text-gray-800 border-b pb-3 flex items-center gap-2">
                    <Briefcase className="text-[#2874f0]" size={20} /> Work With Us
                  </h2>
                  <p className="text-sm text-gray-600">
                    We're building the future of Indian e-commerce. Join our vibrant team of developers, designers, and logistics visionaries.
                  </p>

                  <div className="space-y-4 pt-2">
                    {jobs.map(job => (
                      <div key={job.title} className="p-4 border border-gray-200 rounded hover:border-[#2874f0] transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                          <h3 className="font-bold text-gray-800 text-sm">{job.title}</h3>
                          <div className="flex gap-4 text-xs text-gray-400 mt-1">
                            <span>📂 {job.dept}</span>
                            <span>📍 {job.loc}</span>
                            <span>💼 {job.exp}</span>
                          </div>
                        </div>
                        <button onClick={() => setSelectedJob(job.title)}
                          className="btn-secondary px-4 py-1.5 text-xs rounded-sm whitespace-nowrap">
                          Apply Now
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab: Press & Media */}
              {activeTab === 'press' && (
                <div className="space-y-6 animate-fadeIn">
                  <h2 className="text-xl font-bold text-gray-800 border-b pb-3 flex items-center gap-2">
                    <Newspaper className="text-[#2874f0]" size={20} /> Press Room
                  </h2>
                  <p className="text-sm text-gray-600">
                    Catch up on latest announcements, business milestones, and press highlights from the EasyShop communications team.
                  </p>

                  <div className="space-y-4 pt-2">
                    {pressReleases.map(pr => (
                      <div key={pr.title} className="p-4 bg-gray-50 border border-gray-100 rounded">
                        <span className="text-xs text-gray-400 font-semibold">{pr.date}</span>
                        <h3 className="font-bold text-gray-800 text-sm mt-1">{pr.title}</h3>
                        <a href="#" className="text-[#2874f0] text-xs font-semibold hover:underline block mt-2">Read full release →</a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab: Corporate Information */}
              {activeTab === 'corporate' && (
                <div className="space-y-6 animate-fadeIn">
                  <h2 className="text-xl font-bold text-gray-800 border-b pb-3 flex items-center gap-2">
                    <Building2 className="text-[#2874f0]" size={20} /> Registered Office details
                  </h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-gray-600 leading-relaxed pt-2">
                    <div className="p-4 border border-gray-100 bg-gray-50 rounded">
                      <div className="font-bold text-gray-800 mb-2">🏢 Office Address</div>
                      <p className="text-xs">
                        EasyShop Private Limited,<br/>
                        Buildings Alyssa, Begonia &amp; Clover,<br/>
                        Embassy Tech Village, Outer Ring Road,<br/>
                        Devarabeesanahalli Village, Bengaluru – 560103,<br/>
                        Karnataka, India.
                      </p>
                    </div>

                    <div className="p-4 border border-gray-100 bg-gray-50 rounded">
                      <div className="font-bold text-gray-800 mb-2">📜 Entity Details</div>
                      <p className="text-xs space-y-1">
                        <div><strong>CIN:</strong> U51109KA2022PTC156789</div>
                        <div><strong>GSTIN:</strong> 29AAACE1234F1Z8</div>
                        <div><strong>Telephone:</strong> 1800-208-9898</div>
                        <div><strong>Corporate Email:</strong> admin@easyshop.com</div>
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </section>
          </div>
        </main>
      </div>

      {/* Application Modal Popup */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
            <button onClick={() => setSelectedJob(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg">✕</button>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Apply for Position</h3>
            <p className="text-xs text-blue-600 font-semibold mb-4">{selectedJob}</p>

            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Full Name</label>
                <input required type="text" value={applyForm.name} onChange={e => setApplyForm(f => ({ ...f, name: e.target.value }))} className="input-base" placeholder="John Doe" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Email address</label>
                <input required type="email" value={applyForm.email} onChange={e => setApplyForm(f => ({ ...f, email: e.target.value }))} className="input-base" placeholder="john@example.com" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Resume URL / Link</label>
                <input required type="url" value={applyForm.resume} onChange={e => setApplyForm(f => ({ ...f, resume: e.target.value }))} className="input-base" placeholder="https://drive.google.com/resume.pdf" />
              </div>
              <button type="submit" className="btn-secondary w-full py-2.5 rounded-sm font-semibold text-sm mt-2">
                Submit Application
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default function AboutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f1f3f6] flex flex-col justify-between" />}>
      <AboutPortal />
    </Suspense>
  )
}
