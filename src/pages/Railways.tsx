import { Badge, Button, Card, FloatingElements } from '../components/shared/ui';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { ArrowLeft, ArrowRight, Info, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { useState } from 'react';
import Navbar from '../components/Navbar';

export default function Railways() {
  const [zoom, setZoom] = useState(1);
  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [-400, 0, 400],
    ['rgba(139, 92, 246, 0.2)', 'rgba(168, 85, 247, 0.2)', 'rgba(236, 72, 153, 0.2)']
  );

  const resetPosition = () => {
    x.set(0);
  };

  const zoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.6));

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Navbar variant="minimal" />
      
      {/* Animated background */}
      <motion.div 
        className="absolute inset-0"
        style={{ backgroundColor: background }}
      />

      {/* Floating elements */}
      <FloatingElements variant="purple" intensity="low" />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-violet-400 via-purple-500 to-pink-400 bg-clip-text text-transparent">
              🚂 Railways
            </span>
          </h1>
          <p className="text-xl text-white/70">
            Swipe or drag the minecart along the rails!
          </p>
        </motion.div>

        {/* Railway track container */}
        <div className="w-full max-w-6xl mx-auto">
          <Card padding="lg" hover={false}>
            {/* Zoom controls */}
            <div className="flex justify-end gap-2 mb-4">
              <Button onClick={zoomOut} variant="secondary" size="sm" icon={<ZoomOut className="w-4 h-4" />}>
                Zoom Out
              </Button>
              <Button onClick={zoomIn} variant="secondary" size="sm" icon={<ZoomIn className="w-4 h-4" />}>
                Zoom In
              </Button>
            </div>

            {/* Railway tracks with zoom */}
            <div className="relative h-80 md:h-96 flex items-center justify-center overflow-hidden">
              <motion.div
                style={{ scale: zoom }}
                className="relative w-full h-full flex items-center justify-center"
              >
                {/* Rails */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-8">
                  <div className="relative">
                    {/* Top rail */}
                    <div className="h-3 bg-gradient-to-r from-gray-700 via-gray-500 to-gray-700 rounded-full mb-12 shadow-xl"></div>
                    {/* Bottom rail */}
                    <div className="h-3 bg-gradient-to-r from-gray-700 via-gray-500 to-gray-700 rounded-full shadow-xl"></div>
                    
                    {/* Railroad ties - more ties for bigger track */}
                    <div className="absolute inset-0 flex justify-around items-center px-4">
                      {[...Array(20)].map((_, i) => (
                        <div
                          key={i}
                          className="w-3 h-20 bg-gradient-to-b from-amber-800 to-amber-950 rounded shadow-lg border border-amber-900"
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Draggable minecart */}
                <motion.div
                  drag="x"
                  dragConstraints={{ left: -400, right: 400 }}
                  dragElastic={0.2}
                  dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
                  style={{ x }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative z-10 cursor-grab active:cursor-grabbing"
                >
                  {/* Redesigned Minecart */}
                  <div className="relative">
                    {/* Cart body - more detailed */}
                    <div className="w-32 h-24 bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 rounded-2xl border-4 border-slate-900 shadow-2xl relative overflow-hidden">
                      {/* Inner shadow for depth */}
                      <div className="absolute inset-3 bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-lg"></div>
                      
                      {/* Metal bands */}
                      <div className="absolute top-3 left-2 right-2 h-1.5 bg-gradient-to-r from-gray-600 via-gray-400 to-gray-600 rounded-full shadow-inner"></div>
                      <div className="absolute bottom-3 left-2 right-2 h-1.5 bg-gradient-to-r from-gray-600 via-gray-400 to-gray-600 rounded-full shadow-inner"></div>
                      
                      {/* Rivets */}
                      <div className="absolute top-2 left-3 w-2 h-2 bg-gray-500 rounded-full shadow-inner"></div>
                      <div className="absolute top-2 right-3 w-2 h-2 bg-gray-500 rounded-full shadow-inner"></div>
                      <div className="absolute bottom-2 left-3 w-2 h-2 bg-gray-500 rounded-full shadow-inner"></div>
                      <div className="absolute bottom-2 right-3 w-2 h-2 bg-gray-500 rounded-full shadow-inner"></div>
                    </div>
                    
                    {/* Wheels - larger and more detailed */}
                    <div className="absolute -bottom-4 left-4 w-8 h-8 bg-gradient-to-br from-gray-700 via-gray-900 to-black rounded-full border-3 border-gray-800 shadow-2xl">
                      <div className="absolute inset-2 border-2 border-gray-600 rounded-full"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                      </div>
                    </div>
                    <div className="absolute -bottom-4 right-4 w-8 h-8 bg-gradient-to-br from-gray-700 via-gray-900 to-black rounded-full border-3 border-gray-800 shadow-2xl">
                      <div className="absolute inset-2 border-2 border-gray-600 rounded-full"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                      </div>
                    </div>
                    
                    {/* Shine/highlight effect */}
                    <div className="absolute top-3 left-4 w-12 h-12 bg-gradient-to-br from-white/40 to-transparent rounded-full blur-md"></div>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Position indicator */}
            <motion.div className="mt-8 text-center">
              <Badge variant="purple" size="md">
                <ArrowLeft className="w-4 h-4" />
                Position: {Math.round(x.get())}px
                <ArrowRight className="w-4 h-4" />
              </Badge>
            </motion.div>

            {/* Reset button */}
            <div className="mt-6 flex justify-center gap-3">
              <Button
                onClick={resetPosition}
                variant="glass"
                size="md"
                icon={<RotateCcw className="w-4 h-4" />}
              >
                Reset Position
              </Button>
            </div>
          </Card>
        </div>

        {/* Instructions card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 max-w-md mx-auto"
        >
          <Card padding="md" variant="minimal">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-purple-300 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-2">How to play</h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  On mobile: Swipe the minecart left or right
                  <br />
                  On desktop: Click and drag the minecart
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}