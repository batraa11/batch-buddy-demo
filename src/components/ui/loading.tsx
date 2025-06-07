/**
 * Loading Components
 * Provides loading indicators for various parts of the application
 */
import { motion } from "framer-motion";

/**
 * Primary loading spinner with status messages
 */
export const LoadingSpinner = () => {
  const loadingMessages = [
    "Loading resources...",
    "Preparing data...",
    "Initializing...",
    "Processing request...",
    "Loading content...",
    "Please wait...",
    "Fetching data...",
    "Almost ready..."
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
      <motion.div
        className="w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-gray-600 text-sm"
      >
        {loadingMessages[Math.floor(Math.random() * loadingMessages.length)]}
      </motion.div>
    </div>
  );
};

/**
 * Compact loading indicator for inline use
 */
export const LoadingDots = () => (
  <div className="flex space-x-1">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="w-1.5 h-1.5 bg-blue-500 rounded-full"
        animate={{
          y: ["0%", "-50%", "0%"],
        }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          delay: i * 0.2,
        }}
      />
    ))}
  </div>
); 