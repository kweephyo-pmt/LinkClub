import { Link } from "react-router-dom";
import { MessageSquare, Users, Shield, Zap, ArrowRight, Star, Check } from "lucide-react";

const LandingPage = () => {
  const features = [
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Real-time Messaging",
      description: "Instant messaging with real-time delivery and read receipts"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Group Conversations",
      description: "Create groups and chat with multiple people simultaneously"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Private",
      description: "End-to-end encryption ensures your conversations stay private"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Optimized for speed with instant message delivery"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Product Manager",
      content: "This chat app has revolutionized how our team communicates. The interface is clean and intuitive.",
      rating: 5
    },
    {
      name: "Mike Chen",
      role: "Developer",
      content: "Finally, a chat app that's both powerful and easy to use. The real-time features are impressive.",
      rating: 5
    },
    {
      name: "Emily Davis",
      role: "Designer",
      content: "Beautiful design and smooth user experience. It's become our go-to communication tool.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-base-100 to-secondary/5">
      {/* Navigation */}
      <nav className="navbar bg-base-100/80 backdrop-blur-md border-b border-base-300/50 sticky top-0 z-50">
        <div className="navbar-start">
          <Link to="/" className="btn btn-ghost text-xl font-bold">
            <MessageSquare className="w-6 h-6 text-primary" />
            LinkClub
          </Link>
        </div>
        <div className="navbar-end gap-2">
          <Link to="/login" className="btn btn-ghost">
            Sign In
          </Link>
          <Link to="/signup" className="btn btn-primary">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero min-h-[80vh] bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="hero-content text-center max-w-4xl">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6">
              Connect & Chat
              <br />
              <span className="text-4xl md:text-6xl">Like Never Before</span>
            </h1>
            <p className="text-xl md:text-2xl text-base-content/70 mb-8 leading-relaxed">
              Experience seamless real-time messaging with a beautiful, modern interface. 
              Connect with friends, family, and colleagues instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/signup" className="btn btn-primary btn-lg text-lg px-8">
                Start Chatting
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg text-lg px-8">
                Sign In
              </Link>
            </div>
            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-base-content/60">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                Free to use
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                No ads
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                Secure messaging
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-base-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose LinkClub?
            </h2>
            <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
              Built with modern technology and designed for the best user experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="card bg-base-200/50 hover:bg-base-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
              >
                <div className="card-body items-center text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="card-title text-lg mb-2">{feature.title}</h3>
                  <p className="text-base-content/70">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-r from-base-200/50 to-base-300/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-base-content/70">
              Join thousands of satisfied users worldwide
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="text-base-content/80 mb-4">&ldquo;{testimonial.content}&rdquo;</p>
                  <div className="card-actions justify-end">
                    <div className="text-right">
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-base-content/60">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-content mb-6">
            Ready to Start Chatting?
          </h2>
          <p className="text-xl text-primary-content/80 mb-8 max-w-2xl mx-auto">
            Join our community today and experience the future of messaging
          </p>
          <Link to="/signup" className="btn btn-accent btn-lg text-lg px-8">
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer footer-center p-10 bg-base-200 text-base-content">
        <aside>
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold">LinkClub</span>
          </div>
          <p className="text-base-content/70">
            Modern messaging for the modern world
          </p>
          <p className="text-base-content/60">
            Copyright © 2025 - All rights reserved
          </p>
          <p className="text-base-content/50 text-sm">
            Developed by Phyo Min Thein
          </p>
        </aside>
      </footer>
    </div>
  );
};

export default LandingPage;
