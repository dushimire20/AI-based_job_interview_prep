import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getInterviewsByUserId, getLatestInterviews } from "@/lib/actions/general.action";
import InterviewCard from "@/components/InterviewCard";

async function Home() {
  const user = await getCurrentUser();
  const isAuthenticated = !!user;

  let userInterviews = [];
  let allInterview = [];

  if (isAuthenticated) {
    [userInterviews, allInterview] = await Promise.all([
      getInterviewsByUserId(user?.id!),
      getLatestInterviews({ userId: user?.id! }),
    ]);
  }

  if (isAuthenticated) {
    const hasPastInterviews = userInterviews?.length! > 0;
    const hasUpcomingInterviews = allInterview?.length! > 0;

    return (
      <>
        <section className="card-cta">
          <div className="flex flex-col gap-6 max-w-lg">
            <h2>Get Interview-Ready with AI-Powered Practice & Feedback</h2>
            <p className="text-lg">
              Practice real interview questions & get instant feedback
            </p>

            <Button asChild className="btn-primary max-sm:w-full">
              <Link href="/interview">Start an Interview</Link>
            </Button>
          </div>

          <Image
            src="/robot.png"
            alt="robo-dude"
            width={400}
            height={400}
            className="max-sm:hidden"
          />
        </section>

        <section className="flex flex-col gap-6 mt-8">
          <h2>Your Interviews</h2>

          <div className="interviews-section">
            {hasPastInterviews ? (
              userInterviews?.map((interview) => (
                <InterviewCard
                  key={interview.id}
                  userId={user?.id}
                  interviewId={interview.id}
                  role={interview.role}
                  type={interview.type}
                  techstack={interview.techstack}
                  createdAt={interview.createdAt}
                />
              ))
            ) : (
              <p>You haven&apos;t taken any interviews yet</p>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-6 mt-8">
          <h2>Take Interviews</h2>

          <div className="interviews-section">
            {hasUpcomingInterviews ? (
              allInterview?.map((interview) => (
                <InterviewCard
                  key={interview.id}
                  userId={user?.id}
                  interviewId={interview.id}
                  role={interview.role}
                  type={interview.type}
                  techstack={interview.techstack}
                  createdAt={interview.createdAt}
                />
              ))
            ) : (
              <p>There are no interviews available</p>
            )}
          </div>
        </section>
      </>
    );
  }

  // Landing page for unauthenticated users
  return (
    <main className="flex flex-col gap-0 w-full">
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-linear-to-br from-blue-600/10 via-transparent to-purple-600/10"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <span className="text-primary-100 text-sm font-semibold tracking-wide uppercase animate-bounce" style={{ animationDuration: '3s' }}>
                  ✨ AI-Powered Interview Preparation
                </span>
                <h1 className="text-5xl md:text-7xl font-bold leading-tight bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Master Your Interview Skills with AI
                </h1>
              </div>

              <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
                Stop practicing in the dark. PrepWise is your personal AI interview coach. Get instant, personalized feedback and watch your confidence soar before your big interview.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button asChild className="btn-primary h-12 px-8 text-base hover:scale-105 transition-transform duration-200">
                  <Link href="/sign-up">🚀 Get Started Free</Link>
                </Button>
                <Button asChild variant="outline" className="h-12 px-8 text-base hover:scale-105 transition-transform duration-200">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
              </div>

              <div className="flex items-center gap-6 pt-8">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-500 border-2 border-gray-900 flex items-center justify-center text-sm font-semibold hover:scale-110 transition-transform duration-200"
                    >
                      {i}K+
                    </div>
                  ))}
                </div>
                <span className="text-gray-400">Users crushing their interviews</span>
              </div>
            </div>

            <div className="relative hidden lg:flex justify-center">
              <div className="relative w-96 h-96 bg-linear-to-br from-blue-600/20 to-purple-600/20 rounded-3xl blur-3xl animate-pulse"></div>
              <Image
                src="/robot.png"
                alt="AI Interview Coach"
                width={400}
                height={400}
                className="relative z-10 drop-shadow-2xl hover:scale-110 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Why Choose PrepWise?</h2>
          <p className="text-xl text-gray-400">Everything you need to ace your interview</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="group p-8 rounded-2xl border border-gray-800 hover:border-blue-500/50 transition-all duration-300 bg-gray-900/50 backdrop-blur hover:bg-gray-900/80 hover:shadow-lg hover:shadow-blue-500/10">
            <div className="w-12 h-12 rounded-lg bg-blue-600/20 flex items-center justify-center mb-4 group-hover:bg-blue-600/40 transition-colors group-hover:scale-110 transform duration-300">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">⚡ AI-Powered Feedback</h3>
            <p className="text-gray-400">Get instant, personalized feedback on your responses, communication style, and areas for improvement in seconds.</p>
          </div>

          {/* Feature 2 */}
          <div className="group p-8 rounded-2xl border border-gray-800 hover:border-purple-500/50 transition-all duration-300 bg-gray-900/50 backdrop-blur hover:bg-gray-900/80 hover:shadow-lg hover:shadow-purple-500/10">
            <div className="w-12 h-12 rounded-lg bg-purple-600/20 flex items-center justify-center mb-4 group-hover:bg-purple-600/40 transition-colors group-hover:scale-110 transform duration-300">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">🎯 Real Interview Scenarios</h3>
            <p className="text-gray-400">Practice with questions from Google, Amazon, Microsoft, and more. Experience realistic interview conditions.</p>
          </div>

          {/* Feature 3 */}
          <div className="group p-8 rounded-2xl border border-gray-800 hover:border-green-500/50 transition-all duration-300 bg-gray-900/50 backdrop-blur hover:bg-gray-900/80 hover:shadow-lg hover:shadow-green-500/10">
            <div className="w-12 h-12 rounded-lg bg-green-600/20 flex items-center justify-center mb-4 group-hover:bg-green-600/40 transition-colors group-hover:scale-110 transform duration-300">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">🎤 Voice & Video Practice</h3>
            <p className="text-gray-400">Practice with voice and video to improve delivery, tone, and body language awareness naturally.</p>
          </div>

          {/* Feature 4 */}
          <div className="group p-8 rounded-2xl border border-gray-800 hover:border-orange-500/50 transition-all duration-300 bg-gray-900/50 backdrop-blur hover:bg-gray-900/80 hover:shadow-lg hover:shadow-orange-500/10">
            <div className="w-12 h-12 rounded-lg bg-orange-600/20 flex items-center justify-center mb-4 group-hover:bg-orange-600/40 transition-colors group-hover:scale-110 transform duration-300">
              <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">📊 Performance Tracking</h3>
            <p className="text-gray-400">Watch your improvement with detailed analytics. See exactly how you're progressing over time.</p>
          </div>

          {/* Feature 5 */}
          <div className="group p-8 rounded-2xl border border-gray-800 hover:border-red-500/50 transition-all duration-300 bg-gray-900/50 backdrop-blur hover:bg-gray-900/80 hover:shadow-lg hover:shadow-red-500/10">
            <div className="w-12 h-12 rounded-lg bg-red-600/20 flex items-center justify-center mb-4 group-hover:bg-red-600/40 transition-colors group-hover:scale-110 transform duration-300">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">🎓 Customized Learning</h3>
            <p className="text-gray-400">Tailor your preparation to your exact role, industry, and experience level for maximum impact.</p>
          </div>

          {/* Feature 6 */}
          <div className="group p-8 rounded-2xl border border-gray-800 hover:border-indigo-500/50 transition-all duration-300 bg-gray-900/50 backdrop-blur hover:bg-gray-900/80 hover:shadow-lg hover:shadow-indigo-500/10">
            <div className="w-12 h-12 rounded-lg bg-indigo-600/20 flex items-center justify-center mb-4 group-hover:bg-indigo-600/40 transition-colors group-hover:scale-110 transform duration-300">
              <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">🌙 24/7 Availability</h3>
            <p className="text-gray-400">Practice at midnight or 6 AM. Your AI coach is always awake and ready to help you crush it.</p>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="group p-8 rounded-xl hover:scale-105 transition-transform duration-300">
              <div className="text-4xl md:text-5xl font-bold text-transparent bg-linear-to-r from-blue-400 to-blue-600 bg-clip-text mb-2 group-hover:from-blue-300 group-hover:to-blue-500">10K+</div>
              <p className="text-gray-400 text-lg">Active Users Crushing Interviews</p>
            </div>
            <div className="group p-8 rounded-xl hover:scale-105 transition-transform duration-300">
              <div className="text-4xl md:text-5xl font-bold text-transparent bg-linear-to-r from-purple-400 to-purple-600 bg-clip-text mb-2 group-hover:from-purple-300 group-hover:to-purple-500">50K+</div>
              <p className="text-gray-400 text-lg">Practice Sessions Completed</p>
            </div>
            <div className="group p-8 rounded-xl hover:scale-105 transition-transform duration-300">
              <div className="text-4xl md:text-5xl font-bold text-transparent bg-linear-to-r from-green-400 to-green-600 bg-clip-text mb-2 group-hover:from-green-300 group-hover:to-green-500">95%</div>
              <p className="text-gray-400 text-lg">Success Rate in Getting Offers</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-gray-400">Start your preparation journey in three simple steps</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="relative group">
            <div className="flex flex-col items-center hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 rounded-full bg-linear-to-br from-blue-600 to-blue-400 flex items-center justify-center text-2xl font-bold mb-6 group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300">
                1️⃣
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center">Create Your Profile</h3>
              <p className="text-gray-400 text-center">Sign up and tell us about your target role, company, and experience level.</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative group">
            <div className="flex flex-col items-center hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 rounded-full bg-linear-to-br from-purple-600 to-purple-400 flex items-center justify-center text-2xl font-bold mb-6 group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300">
                2️⃣
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center">Start Practicing</h3>
              <p className="text-gray-400 text-center">Choose from hundreds of interview questions and begin your practice session with AI.</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="group">
            <div className="flex flex-col items-center hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 rounded-full bg-linear-to-br from-green-600 to-green-400 flex items-center justify-center text-2xl font-bold mb-6 group-hover:shadow-lg group-hover:shadow-green-500/50 transition-all duration-300">
                3️⃣
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center">Get Feedback & Ace It</h3>
              <p className="text-gray-400 text-center">Receive detailed AI feedback, track progress, and get hired with confidence.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Success Stories from Real Users</h2>
          <p className="text-xl text-gray-400">See how PrepWise helped people land their dream jobs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Testimonial 1 */}
          <div className="group p-8 rounded-2xl border border-gray-800 hover:border-blue-500/50 transition-all duration-300 bg-gray-900/50 backdrop-blur hover:bg-gray-900/80 hover:shadow-lg hover:shadow-blue-500/10">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-purple-500"></div>
              <div className="ml-4">
                <p className="font-semibold">Sarah Chen</p>
                <p className="text-sm text-gray-400">Google, Senior SWE</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4">
              "PrepWise helped me go from nervous to confident. The AI feedback was eerily accurate and helped me fix my communication issues."
            </p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className="text-yellow-400">⭐</span>
              ))}
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="group p-8 rounded-2xl border border-gray-800 hover:border-purple-500/50 transition-all duration-300 bg-gray-900/50 backdrop-blur hover:bg-gray-900/80 hover:shadow-lg hover:shadow-purple-500/10">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-linear-to-br from-purple-500 to-pink-500"></div>
              <div className="ml-4">
                <p className="font-semibold">Alex Rodriguez</p>
                <p className="text-sm text-gray-400">Meta, Product Manager</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4">
              "I practiced 20 times with PrepWise and nailed my Meta interview. The system really understands what interviewers are looking for."
            </p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className="text-yellow-400">⭐</span>
              ))}
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="group p-8 rounded-2xl border border-gray-800 hover:border-green-500/50 transition-all duration-300 bg-gray-900/50 backdrop-blur hover:bg-gray-900/80 hover:shadow-lg hover:shadow-green-500/10">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-linear-to-br from-green-500 to-blue-500"></div>
              <div className="ml-4">
                <p className="font-semibold">Jordan Kim</p>
                <p className="text-sm text-gray-400">Amazon, Data Scientist</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4">
              "The voice feedback feature is amazing. I finally understood how I actually sound and could improve my delivery. Got 3 offers!"
            </p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className="text-yellow-400">⭐</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="rounded-3xl bg-linear-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 border border-gray-800 p-12 md:p-20 text-center hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">🎯 Ready to Ace Your Interview?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of successful professionals who used PrepWise to land their dream job. Your next offer is waiting.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="btn-primary h-12 px-8 text-base hover:scale-105 transition-transform duration-200 hover:shadow-lg hover:shadow-blue-500/50">
              <Link href="/sign-up">🚀 Start Your Journey</Link>
            </Button>
            <Button asChild variant="outline" className="h-12 px-8 text-base hover:scale-105 transition-transform duration-200">
              <Link href="/sign-in">Returning User?</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-400">Everything you need to know about PrepWise</p>
        </div>

        <div className="space-y-4">
          {[
            {
              question: "How long does each interview practice session take?",
              answer: "Most sessions take 20-45 minutes depending on the role and your pace. You can pause and resume anytime!"
            },
            {
              question: "Will PrepWise work for my specific role or company?",
              answer: "Yes! We have questions from 500+ companies and roles. We offer customization to match your exact target position."
            },
            {
              question: "How is the AI feedback generated?",
              answer: "Our AI analyzes your responses for technical accuracy, communication clarity, pacing, confidence, and more using industry standards."
            },
            {
              question: "Can I practice with real interview recordings?",
              answer: "You can practice with voice and video. Your sessions are private and never shared unless you choose to."
            },
            {
              question: "Is there a free trial?",
              answer: "Yes! Get started free with our basic plan. Upgrade anytime to unlock unlimited questions and advanced analytics."
            }
          ].map((faq, idx) => (
            <details key={idx} className="group p-6 rounded-2xl border border-gray-800 hover:border-blue-500/50 transition-all duration-300 bg-gray-900/50 backdrop-blur cursor-pointer">
              <summary className="flex items-center justify-between font-semibold text-lg hover:text-primary-100 transition-colors">
                {faq.question}
                <span className="group-open:rotate-180 transition-transform duration-300">▼</span>
              </summary>
              <p className="text-gray-400 mt-4">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-4 sm:px-6 lg:px-8 mt-20 bg-linear-to-b from-gray-900/50 to-gray-950">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4 text-lg">PrepWise</h3>
              <p className="text-gray-400 text-sm">Your AI-powered interview preparation platform designed to help you land your dream job.</p>
              <div className="flex gap-3 mt-4">
                <a href="#" className="text-gray-400 hover:text-primary-100 transition-colors">🐦</a>
                <a href="#" className="text-gray-400 hover:text-primary-100 transition-colors">💼</a>
                <a href="#" className="text-gray-400 hover:text-primary-100 transition-colors">🐙</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-primary-100 transition-colors">✨ Features</a></li>
                <li><a href="#" className="hover:text-primary-100 transition-colors">💰 Pricing</a></li>
                <li><a href="#" className="hover:text-primary-100 transition-colors">❓ FAQ</a></li>
                <li><a href="#" className="hover:text-primary-100 transition-colors">🎓 Resources</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-primary-100 transition-colors">📖 About Us</a></li>
                <li><a href="#" className="hover:text-primary-100 transition-colors">📝 Blog</a></li>
                <li><a href="#" className="hover:text-primary-100 transition-colors">✉️ Contact</a></li>
                <li><a href="#" className="hover:text-primary-100 transition-colors">🎯 Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-primary-100 transition-colors">🔒 Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary-100 transition-colors">⚖️ Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary-100 transition-colors">🍪 Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">&copy; 2026 PrepWise. All rights reserved. | Made with ❤️ for interview prep</p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-primary-100 transition-colors text-sm">Twitter</a>
              <a href="#" className="text-gray-400 hover:text-primary-100 transition-colors text-sm">LinkedIn</a>
              <a href="#" className="text-gray-400 hover:text-primary-100 transition-colors text-sm">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default Home;