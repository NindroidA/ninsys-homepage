import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search, Bug, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center max-w-2xl mx-auto"
      >
        {/* 404 number with floating animation */}
        <motion.div
          animate={{
            y: [-10, 10, -10],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="mb-8"
        >
          <h1 className="text-9xl md:text-[12rem] font-bold text-transparent bg-gradient-to-r from-violet-400 via-pink-400 to-purple-600 bg-clip-text leading-none">
            404
          </h1>
        </motion.div>

        {/* main content card */}
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-br from-white/12 via-gray-800/20 to-white/8 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl mb-8"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Oops! Page Not Found
            </h2>
            <p className="text-white/70 text-lg leading-relaxed">
              The page you're looking for seems to have wandered off into the void.
            </p>
          </motion.div>

          {/* suggestion list */}
          <motion.div variants={itemVariants} className="mb-8">
            <h3 className="text-white font-semibold mb-4">Here's what you can do:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <Search className="w-5 h-5 text-purple-300 mb-2" />
                <p className="text-white/80">Check the URL for typos</p>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <RefreshCw className="w-5 h-5 text-purple-300 mb-2" />
                <p className="text-white/80">Refresh the page</p>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <Bug className="w-5 h-5 text-purple-300 mb-2" />
                <p className="text-white/80">Report if this is unexpected</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* action buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/"
            className="group flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105"
          >
            <Home className="w-5 h-5 transition-transform group-hover:scale-110" />
            Back to Home
          </Link>
          
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center justify-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 hover:border-white/30 transition-all duration-300 hover:shadow-lg hover:shadow-white/10"
          >
            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            Go Back
          </button>
        </motion.div>

        {/* quote */}
        <motion.div
          variants={itemVariants}
          className="mt-12 text-center"
        >
          <p className="text-white/50 text-sm italic">
            "Not all who wander are lost... but this page definitely is."
          </p>
        </motion.div>

        {/* decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, -100, 0],
              y: [0, 50, 0],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 2
            }}
            className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl"
          />
        </div>
      </motion.div>
    </div>
  );
}