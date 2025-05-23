import { AnimatePresence, motion } from 'motion/react';

import { PropertyCard } from './blocks';

const DirectoryContent = ({ providers, loading }: any) => {
  function ListingSkeleton() {
    return (
      <div className="animate-pulse">
        <div className="h-[250px] bg-gray-200 rounded-xl mb-4"></div>
        <div className="flex items-center">
          <div className="h-[32px] w-[32px] bg-gray-200 rounded-full me-4"></div>
          <div className="h-[20px] w-[70px] bg-gray-200 rounded-xl"></div>
          <div className="h-[20px] w-[30px] bg-gray-200 rounded-xl ms-auto"></div>
        </div>
      </div>
    );
  }

  // Animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: any) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i === 0 ? 0 : i * 0.1, // First item has no delay
        duration: 0.3,
        ease: 'easeOut'
      }
    })
  };

  // Container variants for immediate start
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Controls the stagger between children
        delayChildren: 0 // No initial delay before starting
      }
    }
  };

  return (
    <>
      <main className="w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7"
        >
          <AnimatePresence>
            {loading
              ? Array.from({ length: 10 }).map((_, index) => (
                  <motion.div key={index} variants={itemVariants} custom={index}>
                    <ListingSkeleton />
                  </motion.div>
                ))
              : providers.map((provider: any, index: number) => (
                  <motion.div
                    key={provider.id}
                    variants={itemVariants}
                    custom={index}
                    className="card-rounded mb-2"
                  >
                    <PropertyCard data={provider} />
                  </motion.div>
                ))}
          </AnimatePresence>
        </motion.div>
      </main>
    </>
  );
};

export { DirectoryContent };
