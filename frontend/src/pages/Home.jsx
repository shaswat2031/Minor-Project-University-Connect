import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaLinkedin,  FaArrowRight } from "react-icons/fa";
import { Parallax } from "react-parallax";
import team1 from "../assets/harshita.jpg";
import team2 from "../assets/sugam.jpg";
import team3 from "../assets/vansh.jpg";
import Hero from "../assets/Adult.jpeg";
import team4 from "../assets/Shaswat.jpg";
import certification from "../assets/Certificate.jpeg";
import Parallaxeffect from "../assets/parallaxeffect.jpeg";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  return (
    <div className="flex flex-col font-[Poppins]">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-gray-900 to-blue-900 p-8 md:p-12 text-white shadow-2xl ">
        <motion.div
          className="md:w-1/2 p-4 md:p-5 text-center md:text-left"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-blue-400 leading-tight">
            Welcome to <span className="text-white">University Connect</span>
          </h1>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-300 mb-4 italic">
            &quot;Bridging Students, Building Futures.&quot;
          </h2>
          <p className="text-base md:text-lg text-gray-300 font-medium leading-relaxed">
            A platform to connect students, showcase talents, and explore career
            opportunities.
          </p>
        </motion.div>
        <motion.div 
          className="md:w-1/2 w-full h-auto rounded-lg shadow-lg mt-6 md:mt-0 overflow-hidden"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <img
            src={Hero}
            alt="University Connect"
            className="w-full h-full object-cover object-center min-h-[300px]"
            loading="lazy"
          />
        </motion.div>
      </section>

      {/* About the Project */}
      <section className="w-full bg-gradient-to-b from-gray-900 to-gray-800 py-12 md:py-16 text-center text-white relative">
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0tNCAwSDh2LTRoMjR2NHoiLz48cGF0aCBkPSJNMjAgMTJoMzR2MzRIMjBWMTJ6bTQgNGgyNnYyNkgyNFYxNnoiLz48cGF0aCBkPSJNNCAxMmgxNHYxNEg0VjEyem00IDRoNnY2SDh2LTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')]"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto px-4 md:px-6 relative z-10"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            About the Project
          </h2>
          <p className="text-base md:text-lg text-gray-200 font-medium leading-relaxed">
            <span className="text-cyan-400 font-semibold">
              University Connect
            </span>{" "}
            is a student-driven platform designed to
            <span className="font-semibold text-yellow-300">
              {" "}
              connect, collaborate, and grow.
            </span>{" "}
            Whether you&apos;re looking to showcase your skills, find mentors, or
            explore new opportunities, this platform provides the perfect space
            for students to
            <span className="font-semibold text-yellow-300"> engage and thrive.</span>
          </p>
          <p className="text-base md:text-lg text-gray-300 font-medium leading-relaxed mt-4">
            Our goal is to create a dynamic ecosystem where students can
            discover potential career paths, build meaningful connections, and
            access exclusive learning resources.
          </p>
        </motion.div>
      </section>

           {/* Team Members Section - Enhanced */}
           <section className="py-16 md:py-20 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
          <motion.div
            className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl"
            animate={{
              x: [0, 10, 0],
              y: [0, -10, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-1/3 left-1/3 w-72 h-72 bg-purple-500 rounded-full filter blur-3xl"
            animate={{
              x: [0, -15, 0],
              y: [0, 15, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: 2
            }}
          />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <motion.div
            className="mb-12 md:mb-16 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold inline bg-gradient-to-r from-blue-400 via-purple-400 to-blue-500 bg-clip-text text-transparent pb-2">
              Meet Our Team
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mt-4 opacity-80"></div>
            <p className="mt-4 text-gray-300 max-w-2xl mx-auto text-base md:text-lg">
              The brilliant minds behind University Connect, working together to create a platform that bridges students with opportunities.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            {[
              {
                name: "Harshita Mutha",
                role: "Reports Documentation & Database Manager",
                img: team1,
                linkedin: "https://www.linkedin.com/in/harshita-mutha-196b08275/",
                description:
                  "Harshita ensures a seamless user experience by crafting intuitive designs and structuring platform documentation. She plays a vital role in UI/UX improvements and platform accessibility."
              },
              {
                name: "Sugam Bhardwaj",
                role: "UI/UX Designer",
                img: team2,
                linkedin: "https://www.linkedin.com/in/sugam-sharma-758660253",
                description:
                  "Sugam is the creative force behind the platform's visual identity, focusing on user-centric designs that enhance interaction and engagement."
              },
              {
                name: "Vansh Patel",
                role: "Backend Developer & Project Leader",
                img: team3,
                linkedin: "https://www.linkedin.com/in/vanshpatel005",
                description:
                  "Vansh is responsible for the backend development, ensuring smooth API communication, database management, and robust server-side functionality."
              },
            ].map((member, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl overflow-hidden w-full max-w-sm border border-gray-700/50 group transition-all duration-300 transform hover:scale-[1.02] hover:shadow-blue-500/20 hover:border-blue-500/70"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: index * 0.2 }}
                whileHover={{ boxShadow: "0 20px 30px -10px rgba(30, 58, 138, 0.15)" }}
              >
                <div className="relative aspect-square overflow-hidden bg-gray-800">
                  {/* Animated gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent z-10"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-purple-900/30 to-transparent z-10 opacity-0 group-hover:opacity-70 transition-opacity duration-500"></div>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: index * 0.2 + 0.3 }}
                    className="h-full w-full"
                  >
                    <img
                      src={member.img}
                      alt={member.name}
                      className="w-full h-full object-cover object-center transform group-hover:scale-110 transition-transform duration-1000"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x400?text=Team+Member';
                      }}
                    />
                  </motion.div>
                  
                  {/* Photo overlay with social links */}
                  <div className="absolute inset-x-0 bottom-0 p-5 z-20 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-2xl font-bold text-white text-shadow mb-1">{member.name}</h3>
                    <p className="text-blue-300 font-medium text-shadow text-sm md:text-base mb-3">{member.role}</p>
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 p-2 rounded-full text-white hover:bg-blue-700 transition-colors"
                        aria-label={`${member.name}'s LinkedIn profile`}
                      >
                        <FaLinkedin className="text-lg" />
                      </a>
                      
                    </div>
                  </div>
                </div>
                
                <div className="p-5 md:p-6">
                  <p className="text-gray-300 mb-5 line-clamp-3 text-sm md:text-base">
                    {member.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-400 font-semibold group transition-all hover:text-blue-300 text-sm md:text-base"
                      aria-label={`Connect with ${member.name} on LinkedIn`}
                    >
                      <span className="border-b border-blue-400/0 group-hover:border-blue-400/100 pb-0.5 transition-all">
                        Connect
                      </span>
                      <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                    </a>
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Fourth team member - featured with larger card */}
          <motion.div
            className="mt-12 md:mt-16 mx-auto max-w-2xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
          >
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl overflow-hidden border border-gray-700/50 group transition-all duration-300 transform hover:scale-[1.02] hover:shadow-blue-500/20 hover:border-blue-500/70">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-2/5 relative bg-gray-800">
                  <div className="aspect-square md:aspect-auto md:h-full">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-gray-900/70 z-10 hidden md:block"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/70 z-10 md:hidden"></div>
                    <div className="absolute inset-0 bg-gradient-to-r md:from-blue-900/50 to-purple-900/30 z-10 opacity-0 group-hover:opacity-70 transition-opacity duration-500"></div>
                    
                    <motion.div
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8, delay: 0.9 }}
                      className="h-full w-full"
                    >
                      <img
                        src={team4}
                        alt="Shaswat Prasad"
                        className="w-full h-full object-cover object-center transform group-hover:scale-110 transition-transform duration-1000"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/400x400?text=Shaswat+Prasad';
                        }}
                      />
                    </motion.div>
                    
                    {/* Mobile only - name overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 z-20 md:hidden">
                      <h3 className="text-2xl font-bold text-white text-shadow">Shaswat Prasad</h3>
                      <p className="text-blue-300 font-medium text-shadow">Frontend Developer</p>
                    </div>
                  </div>
                </div>
                
                <div className="md:w-3/5 p-5 md:p-8">
                  {/* Desktop only - name/title */}
                  <div className="hidden md:block">
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-1">Shaswat Prasad</h3>
                    <p className="text-blue-300 font-medium mb-4 text-base">Frontend Developer</p>
                  </div>
                  
                  <p className="text-gray-300 mb-6 text-sm md:text-base leading-relaxed">
                    Shaswat specializes in developing engaging and dynamic user
                    interfaces, ensuring smooth and responsive experiences across all
                    devices. He focuses on creating interactive components and optimizing
                    performance.
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <a
                      href="https://www.linkedin.com/in/shaswat-prasad/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-400 font-semibold hover:text-blue-300 transition-all group text-sm md:text-base"
                      aria-label="Connect with Shaswat Prasad on LinkedIn"
                    >
                      <FaLinkedin className="text-xl group-hover:scale-110 transition-transform" /> 
                      <span className="border-b border-blue-400/0 group-hover:border-blue-400/100 pb-0.5 transition-all">
                        Connect on LinkedIn
                      </span>
                      <FaArrowRight className="text-sm ml-1 group-hover:translate-x-1 transition-transform" />
                    </a>
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* CSS for text shadow and additional effects */}
        <style>
          {`
          .text-shadow {
            text-shadow: 0 2px 4px rgba(0,0,0,0.7);
          }
          
          @keyframes subtle-float {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-5px);
            }
          }
          
          .animate-float {
            animation: subtle-float 5s ease-in-out infinite;
          }
          `}
        </style>
      </section>

      {/* Features Section */}
      <section className="w-full bg-gradient-to-b from-gray-900 to-gray-800 py-12 md:py-16 text-white relative overflow-hidden">
  {/* Animated gradient background elements */}
  <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
    <motion.div
      className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl"
      animate={{
        x: [0, 20, 0],
        y: [0, -30, 0],
      }}
      transition={{
        duration: 15,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }}
    />
    <motion.div
      className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl"
      animate={{
        x: [0, -20, 0],
        y: [0, 30, 0],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        delay: 3
      }}
    />
  </div>
  
  <div className="relative z-10">
    <motion.h2 
      className="text-3xl md:text-5xl font-extrabold text-center mb-8 md:mb-12"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent animate-gradient">
        Platform Features
      </span>
    </motion.h2>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 md:px-8 max-w-6xl mx-auto">
      {[
        {
          title: "Student Profiles",
          description: "Create and manage your profile, showcase skills, and connect with peers.",
          emoji: "🎓",
          gradient: "from-blue-500 to-cyan-400"
        },
        {
          title: "Talent Marketplace",
          description: "Offer and hire student services like design, coding, and content creation.",
          emoji: "🛍️",
          gradient: "from-purple-500 to-pink-500"
        },
        {
          title: "Messaging System",
          description: "Chat with students and collaborate on projects in real-time.",
          emoji: "💬",
          gradient: "from-green-500 to-teal-400"
        },
        {
          title: "Certifications",
          description: "Earn and display certifications to boost credibility.",
          emoji: "📜",
          gradient: "from-yellow-500 to-amber-500"
        },
        {
          title: "Career Opportunities",
          description: "Find internships, jobs, and networking events tailored for students.",
          emoji: "🚀",
          gradient: "from-red-500 to-orange-500"
        },
        {
          title: "Secure Authentication",
          description: "Safe and secure login to protect your personal information.",
          emoji: "🔒",
          gradient: "from-indigo-500 to-blue-500"
        },
      ].map((feature, index) => (
        <motion.div
          key={index}
          className="relative group bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg rounded-2xl p-6 flex flex-col items-center text-center border border-gray-700 overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: index * 0.15 }}
          whileHover={{ y: -5 }}
        >
          {/* Animated background gradient on hover */}
          <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
          
          {/* Glow effect */}
          <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
               style={{
                 boxShadow: `0 0 40px 10px rgba(59, 130, 246, 0.15)`
               }}>
          </div>
          
          {/* Emoji circle with gradient */}
          <motion.div 
            className={`w-20 h-20 rounded-full bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg`}
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <span className="text-3xl">{feature.emoji}</span>
          </motion.div>
          
          <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
            {feature.title}
          </h3>
          <p className="text-gray-300 font-medium text-sm md:text-base leading-relaxed">
            {feature.description}
          </p>
          
          {/* Subtle hover indicator */}
          <div className="mt-6 w-8 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </motion.div>
      ))}
    </div>
  </div>
  <style>
    {`
    @keyframes gradient {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    .animate-gradient {
      background-size: 200% 200%;
      animation: gradient 6s ease infinite;
    }
    `}
  </style>
</section>




      {/* Parallax Section */}
      <Parallax
        bgImage={Parallaxeffect}
        strength={400}
        blur={{ min: -5, max: 5 }}
      >
        <div className="h-[300px] md:h-[400px] flex items-center justify-center relative">
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center relative z-10 px-4"
          >
            <motion.h2 
              className="text-3xl md:text-5xl font-extrabold mb-4 md:mb-6 text-blue-400"
              animate={{ 
                textShadow: ["0 0 5px rgba(96, 165, 250, 0)", "0 0 15px rgba(96, 165, 250, 0.5)", "0 0 5px rgba(96, 165, 250, 0)"] 
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              Get Certified Today!
            </motion.h2>
            <p className="text-xl md:text-3xl text-white font-medium leading-relaxed mb-4 md:mb-6">
              Validate your skills and boost your career with our certification program.
            </p>
            <motion.a
              href="/certifications"
              className="mt-4 md:mt-6 inline-block bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 md:px-8 md:py-4 rounded-lg text-base md:text-lg font-semibold transition duration-300 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Start your certification"
            >
              Start Your Certification
            </motion.a>
          </motion.div>
        </div>
      </Parallax>

      {/* Certification Promotion Section */}
      <section className="w-full bg-gradient-to-b from-gray-900 to-gray-800 py-12 md:py-16 text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-6xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center"
        >
          <div className="w-full md:w-1/2 flex justify-center relative mb-8 md:mb-0">
            <motion.div
              className="absolute -right-4 -bottom-4 w-full h-full bg-blue-500 rounded-lg opacity-50"
              animate={{ 
                right: ["-1rem", "-0.5rem", "-1rem"],
                bottom: ["-1rem", "-0.5rem", "-1rem"]
              }}
              transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
            ></motion.div>
            <div className="w-3/4 md:w-full rounded-lg shadow-lg relative z-10 overflow-hidden">
              <img
                src={certification}
                alt="Get Certified"
                className="w-full h-full object-cover object-center min-h-[300px]"
                loading="lazy"
              />
            </div>
          </div>

          <div className="w-full md:w-1/2 md:pl-8 lg:pl-12 text-center md:text-left">
            <h3 className="text-base md:text-lg font-semibold uppercase bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent mb-2">
              Validate Your Skills, Boost Your Career
            </h3>
            <h2 className="text-2xl md:text-4xl font-extrabold mb-4 md:mb-6 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Pass the Test & Get Certified!
            </h2>
            <p className="text-base md:text-lg text-gray-300 font-medium leading-relaxed">
              Want to prove your expertise? Take our certification test, pass
              with confidence, and earn a verified certificate from our platform.
            </p>
            <p className="text-base md:text-lg text-gray-300 font-medium leading-relaxed mt-4">
              Your certification is more than just a document—it&apos;s a testament
              to your dedication and knowledge.
            </p>
            <div className="mt-6 md:mt-8">
              <motion.a
                href="/certifications"
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 md:px-8 md:py-4 rounded-lg text-base md:text-lg font-bold transition duration-300 shadow-lg inline-flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Start certification now"
              >
                <span>Start Your Certification Now</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </motion.a>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;