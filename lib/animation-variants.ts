import { Variants } from 'framer-motion'

export const fadeInUp: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    willChange: 'transform, opacity'
  },
  visible: { 
    opacity: 1, 
    y: 0,
    willChange: 'auto',
    transition: { 
      duration: 0.6, 
      ease: "easeOut"
    }
  }
}

export const fadeIn: Variants = {
  hidden: { 
    opacity: 0,
    willChange: 'opacity'
  },
  visible: { 
    opacity: 1,
    willChange: 'auto',
    transition: { duration: 0.6 }
  }
}

export const scaleIn: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95,
    willChange: 'transform, opacity'
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    willChange: 'auto',
    transition: { duration: 0.5, ease: "easeOut" }
  }
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
}

export const slideInFromLeft: Variants = {
  hidden: { 
    opacity: 0, 
    x: -30,
    willChange: 'transform, opacity'
  },
  visible: { 
    opacity: 1, 
    x: 0,
    willChange: 'auto',
    transition: { duration: 0.6, ease: "easeOut" }
  }
}

export const slideInFromRight: Variants = {
  hidden: { 
    opacity: 0, 
    x: 30,
    willChange: 'transform, opacity'
  },
  visible: { 
    opacity: 1, 
    x: 0,
    willChange: 'auto',
    transition: { duration: 0.6, ease: "easeOut" }
  }
}
