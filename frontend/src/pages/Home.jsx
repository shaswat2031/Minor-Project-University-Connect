import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaLinkedin, FaCheckCircle } from "react-icons/fa";
import team1 from "../assets/harshita.jpg";
import team2 from "../assets/sugam.jpg";
import team3 from "../assets/vansh.jpg";
import Hero from "../assets/Adult.jpeg";
import team4 from "../assets/shaswat.jpg";
import certification from "../assets/Certificate.jpeg";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  return (
    <div className="flex flex-col font-[Poppins]">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between bg-gray-900 p-12 text-white">
        <motion.div
          className="md:w-1/2 p-5 text-center md:text-left"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl font-extrabold mb-4 text-blue-400 leading-tight">
            Welcome to <span className="text-white">University Connect</span>
          </h1>
          <h2 className="text-2xl font-semibold text-gray-300 mb-4 italic">
            "Bridging Students, Building Futures."
          </h2>
          <p className="text-lg text-gray-300 font-medium leading-relaxed">
            A platform to connect students, showcase talents, and explore career
            opportunities.
          </p>
        </motion.div>
        <motion.img
          src={Hero}
          alt="University Connect"
          className="md:w-1/2 w-full h-auto rounded-lg shadow-lg"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        />
      </section>

      {/* About the Project */}
      <section className="w-full bg-gray-800 py-16 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto px-6"
        >
          <h2 className="text-4xl font-extrabold mb-6 text-blue-400">
            About the Project
          </h2>
          <p className="text-lg text-gray-300 font-medium leading-relaxed">
            <span className="text-blue-400 font-semibold">
              University Connect
            </span>{" "}
            is a student-driven platform designed to
            <span className="font-semibold">
              {" "}
              connect, collaborate, and grow.
            </span>{" "}
            Whether you're looking to showcase your skills, find mentors, or
            explore new opportunities, this platform provides the perfect space
            for students to
            <span className="font-semibold"> engage and thrive.</span>
          </p>
          <p className="text-lg text-gray-300 font-medium leading-relaxed mt-4">
            Our goal is to create a dynamic ecosystem where students can
            discover potential career paths, build meaningful connections, and
            access exclusive learning resources. From networking with
            like-minded peers to gaining insights from industry professionals,{" "}
            <span className="text-blue-400 font-semibold">
              University Connect
            </span>{" "}
            is your gateway to success.
          </p>
          <p className="text-lg text-gray-300 font-medium leading-relaxed mt-4">
            Whether you're a student looking for internship opportunities, a
            freelancer offering services, or an aspiring entrepreneur seeking
            collaborators, this platform equips you with the right tools to take
            your ambitions to the next level.
          </p>
        </motion.div>
      </section>

      {/* Team Members Section */}
      <section className="py-16 bg-gray-900 text-white">
        <h2 className="text-4xl font-extrabold text-center mb-8 text-blue-400">
          Meet Our Team
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-center px-8">
          {[
            {
              name: "Harshita Mutha",
              role: "Reports Documentation & DataBase Manager",
              img: team1,
              linkedin: "https://www.linkedin.com/in/harshita-mutha-196b08275/",
              description:
                "Harshita ensures a seamless user experience by crafting intuitive designs and structuring platform documentation. She plays a vital role in UI/UX improvements, platform accessibility, and maintaining well-organized project reports. Her keen eye for design and documentation helps keep the project both user-friendly and professionally documented.",
            },
            {
              name: "Sugam Sharma",
              role: "UI/UX Designer",
              img: team2,
              linkedin: "https://www.linkedin.com/in/sugam-sharma-758660253",
              description:
                "Sugam is the creative force behind the platform's visual identity, focusing on user-centric designs that enhance interaction and engagement. He ensures the platform's look and feel align with modern design standards, optimizing layouts, typography, and color schemes for an aesthetically pleasing experience.",
            },
            {
              name: "Vansh Patel",
              role: "Backend Developer & Project Leader",
              img: team3,
              linkedin: "https://www.linkedin.com/in/vanshpatel005",
              description:
                "Vansh is responsible for the backend development, ensuring smooth API communication, database management, and robust server-side functionality. He works on optimizing data storage, securing endpoints, and integrating features that enable real-time interactions, making the platform scalable and efficient.",
            },
          ].map((member, index) => (
            <motion.div
              key={index}
              className="bg-gray-800 p-6 rounded-lg shadow-md text-center flex flex-col items-center transition-transform hover:scale-105 border border-gray-700"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: index * 0.2 }}
            >
              <img
                src={member.img}
                alt={member.name}
                className="w-44 h-44 rounded-full border-4 border-blue-400 shadow-md mb-4"
              />
              <h3 className="text-2xl font-semibold text-blue-300">
                {member.name}
              </h3>
              <p className="text-lg text-gray-400 font-medium mb-2">
                {member.role}
              </p>
              <p className="text-sm text-gray-400 italic px-2">
                {member.description}
              </p>
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-blue-400 font-semibold hover:text-blue-500 transition"
              >
                <FaLinkedin className="text-xl" /> Connect on LinkedIn
              </a>
            </motion.div>
          ))}
        </div>

        {/* Single row for the fourth member */}
        <div className="grid grid-cols-1 mt-6 justify-center px-8">
          <motion.div
            className="bg-gray-800 p-6 rounded-lg shadow-md text-center flex flex-col items-center transition-transform hover:scale-105 border border-gray-700 mx-auto max-w-md"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            <img
              src={team4}
              alt="Shaswat Prasad"
              className="w-44 h-44 rounded-full border-4 border-blue-400 shadow-md mb-4"
            />
            <h3 className="text-2xl font-semibold text-blue-300">
              Shaswat Prasad
            </h3>
            <p className="text-lg text-gray-400 font-medium mb-2">
              Frontend Developer
            </p>
            <p className="text-sm text-gray-400 italic px-2">
              Shaswat specializes in developing engaging and dynamic user
              interfaces, ensuring smooth and responsive experiences across all
              devices. He focuses on creating interactive components, optimizing
              performance, and maintaining a seamless connection between the
              frontend and backend. His contributions make navigation effortless
              and enhance user interaction.
            </p>
            <a
              href="https://www.linkedin.com/in/shaswat-prasad/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-blue-400 font-semibold hover:text-blue-500 transition"
            >
              <FaLinkedin className="text-xl" /> Connect on LinkedIn
            </a>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full bg-gray-800 py-16 text-white">
        <h2 className="text-5xl font-extrabold text-center mb-12 text-blue-400">
          🚀 Platform Features
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-8 max-w-6xl mx-auto">
          {[
            {
              title: "🎓 Student Profiles",
              description:
                "Create and manage your profile, showcase skills, and connect with peers.",
            },
            {
              title: "🛍️ Talent Marketplace",
              description:
                "Offer and hire student services like design, coding, and content creation.",
            },
            {
              title: "💬 Messaging System",
              description:
                "Chat with students and collaborate on projects in real-time.",
            },
            {
              title: "📜 Certifications",
              description:
                "Earn and display certifications to boost credibility.",
            },
            {
              title: "🚀 Career Opportunities",
              description:
                "Find internships, jobs, and networking events tailored for students.",
            },
            {
              title: "🔒 Secure Authentication",
              description:
                "Safe and secure login to protect your personal information.",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="relative bg-gray-900 shadow-lg rounded-2xl p-6 flex flex-col items-center text-center border border-gray-700 transition-all transform hover:scale-105 hover:shadow-xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: index * 0.2 }}
            >
              <FaCheckCircle className="text-5xl text-blue-400 mb-4 animate-bounce" />
              <h3 className="text-2xl font-semibold text-blue-300">
                {feature.title}
              </h3>
              <p className="mt-2 text-gray-400 font-medium">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Hero section to promote Certifications */}
<section className="w-full bg-gray-900 py-16 text-white">
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7 }}
    className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center"
  >
    {/* Image on the Left */}
    <div className="w-full md:w-1/2 flex justify-center">
      <img
        src={certification}
        alt="Get Certified"
        className="w-3/4 md:w-full rounded-lg shadow-lg"
      />
    </div>

    {/* Text on the Right */}
    <div className="w-full md:w-1/2 md:pl-12 text-center md:text-left">
      <h3 className="text-lg font-semibold uppercase text-yellow-400 mb-2">
        Validate Your Skills, Boost Your Career
      </h3>
      <h2 className="text-4xl font-extrabold mb-6 text-blue-400">
        Pass the Test & Get Certified!
      </h2>
      <p className="text-lg text-gray-300 font-medium leading-relaxed">
        Want to prove your expertise? Take our certification test, pass with
        confidence, and earn a verified certificate from our platform. Show
        potential employers and peers that you have what it takes!
      </p>
      <p className="text-lg text-gray-300 font-medium leading-relaxed mt-4">
        Your certification is more than just a document—it's a testament to your
        dedication and knowledge. Share it on LinkedIn, include it in your
        resume, and open doors to new opportunities.
      </p>
      {/* CTA Button */}
      <div className="mt-6">
        <a
          href="/certifications"
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold transition duration-300"
        >
          Start Your Certification Now
        </a>
      </div>
    </div>
  </motion.div>
</section>

    </div>
  );
};

export default Home;
