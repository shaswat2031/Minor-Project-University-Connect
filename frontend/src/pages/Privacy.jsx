import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import {
  FaShieldAlt,
  FaUserLock,
  FaCookieBite,
  FaUserFriends,
  FaServer,
  FaGlobe,
} from "react-icons/fa";

const Privacy = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.6,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-300 py-16 font-[Poppins]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <div className="flex justify-center items-center">
            <div className="h-1 w-20 bg-blue-500 rounded-full"></div>
          </div>
          <p className="mt-6 text-xl text-gray-400">
            Your privacy matters to us. This policy outlines how University
            Connect handles your information.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="p-2 bg-blue-500/10 rounded-full">
              <FaShieldAlt className="text-4xl text-blue-400" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            Last Updated: July 28, 2025
          </p>
        </motion.div>

        {/* Introduction */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          <motion.div
            variants={itemVariants}
            className="bg-gray-800/50 rounded-xl p-6 md:p-8 shadow-lg border border-gray-700/50"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Introduction</h2>
            <p className="mb-4">
              University Connect (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or
              &ldquo;us&rdquo;) is committed to protecting your privacy. This
              Privacy Policy explains how your personal information is
              collected, used, and disclosed by University Connect.
            </p>
            <p>
              This Privacy Policy applies to our website, mobile applications,
              and other online services (collectively, our
              &ldquo;Services&rdquo;), including when you interact with us
              through our Services, receive our communications, or attend our
              events.
            </p>
          </motion.div>

          {/* Section with icon */}
          <PolicySection
            icon={<FaUserLock />}
            title="Information We Collect"
            content={
              <>
                <p className="mb-4">
                  We collect information you provide directly to us, including:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>
                    <span className="text-blue-400 font-medium">
                      Account Information:
                    </span>{" "}
                    When you register, we collect your name, email address,
                    password, educational institution, and profile information.
                  </li>
                  <li>
                    <span className="text-blue-400 font-medium">
                      Profile Information:
                    </span>{" "}
                    Information you add to your profile such as your photo,
                    skills, education history, and career interests.
                  </li>
                  <li>
                    <span className="text-blue-400 font-medium">
                      Communications:
                    </span>{" "}
                    Content of messages you send through our platform.
                  </li>
                  <li>
                    <span className="text-blue-400 font-medium">
                      Survey Responses:
                    </span>{" "}
                    Information you provide in response to surveys.
                  </li>
                </ul>
                <p>
                  We also automatically collect certain information when you use
                  our Services, including log data, device information, and
                  location information.
                </p>
              </>
            }
            variants={itemVariants}
          />

          <PolicySection
            icon={<FaServer />}
            title="How We Use Your Information"
            content={
              <>
                <p className="mb-4">
                  We use your information for various purposes, including to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide, maintain, and improve our Services</li>
                  <li>
                    Manage your account and provide you with customer support
                  </li>
                  <li>
                    Connect you with other students, mentors, and opportunities
                  </li>
                  <li>Personalize your experience and content</li>
                  <li>Process transactions and send related information</li>
                  <li>
                    Send you technical notices, updates, security alerts, and
                    support messages
                  </li>
                  <li>Respond to your comments, questions, and requests</li>
                  <li>Develop new products and services</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </>
            }
            variants={itemVariants}
          />

          <PolicySection
            icon={<FaUserFriends />}
            title="Sharing of Information"
            content={
              <>
                <p className="mb-4">
                  We may share your information as follows:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <span className="text-blue-400 font-medium">
                      With other users:
                    </span>{" "}
                    Your profile information and content you post may be visible
                    to other users based on your privacy settings.
                  </li>
                  <li>
                    <span className="text-blue-400 font-medium">
                      With service providers:
                    </span>{" "}
                    We share information with vendors who help us provide
                    services.
                  </li>
                  <li>
                    <span className="text-blue-400 font-medium">
                      For legal reasons:
                    </span>{" "}
                    We may share information when required by law or to protect
                    rights and safety.
                  </li>
                </ul>
                <p className="mt-4">
                  We do not sell or rent your personal information to third
                  parties for marketing purposes.
                </p>
              </>
            }
            variants={itemVariants}
          />

          <PolicySection
            icon={<FaCookieBite />}
            title="Cookies and Tracking Technologies"
            content={
              <>
                <p className="mb-4">
                  We use cookies and similar technologies to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Keep you logged in to our platform</li>
                  <li>Remember your preferences</li>
                  <li>Understand how you use our Services</li>
                  <li>Personalize content and recommendations</li>
                  <li>Analyze the performance of our Services</li>
                </ul>
                <p className="mt-4">
                  You can configure your browser to refuse cookies or alert you
                  when cookies are being sent. However, some parts of our
                  Services may not function properly without cookies.
                </p>
              </>
            }
            variants={itemVariants}
          />

          <PolicySection
            icon={<FaGlobe />}
            title="Your Rights and Choices"
            content={
              <>
                <p className="mb-4">
                  Depending on your location, you may have certain rights
                  regarding your personal information:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <span className="text-blue-400 font-medium">Access:</span>{" "}
                    You can request a copy of your personal information.
                  </li>
                  <li>
                    <span className="text-blue-400 font-medium">
                      Correction:
                    </span>{" "}
                    You can request that we correct inaccurate information.
                  </li>
                  <li>
                    <span className="text-blue-400 font-medium">Deletion:</span>{" "}
                    You can request that we delete your information.
                  </li>
                  <li>
                    <span className="text-blue-400 font-medium">Opt-out:</span>{" "}
                    You can opt out of certain uses of your information.
                  </li>
                </ul>
                <p className="mt-4">
                  You can update your account information at any time by logging
                  into your account and accessing your settings.
                </p>
              </>
            }
            variants={itemVariants}
          />

          {/* Final sections */}
          <motion.div
            variants={itemVariants}
            className="bg-blue-900/20 rounded-xl p-6 md:p-8 shadow-lg border border-blue-800/30"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p className="mb-4">
              If you have any questions about this Privacy Policy, please
              contact us at:
            </p>
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <p className="mb-1">
                <span className="text-blue-400 font-semibold">Email:</span>
                2203051050530@paruluniversity.ac.in
              </p>
              <p>
                <span className="text-blue-400 font-semibold">Address:</span>{" "}
                Parul University , Vadrodra Gujarat
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-12 text-center text-sm text-gray-500"
        >
          <p>
            This privacy policy is effective as of March 25, 2025 and will
            remain in effect except with respect to any changes in its
            provisions in the future.
          </p>
        </motion.div>
      </div>
    </div>
  );
};
// Component for policy sections with icons
const PolicySection = ({ icon, title, content, variants }) => (
  <motion.div
    variants={variants}
    className="bg-gray-800/50 rounded-xl p-6 md:p-8 shadow-lg border border-gray-700/50"
  >
    <div className="flex items-start">
      <div className="mr-4 mt-1 bg-blue-500/10 p-2 rounded-full">
        <div className="text-blue-400 text-xl">{icon}</div>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
        {content}
      </div>
    </div>
  </motion.div>
);

PolicySection.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  content: PropTypes.node.isRequired,
  variants: PropTypes.object,
};

export default Privacy;
