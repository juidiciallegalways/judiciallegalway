# 🔧 DRM PDF Reader - Complete Technical Stack

## 📚 **Core PDF Rendering Libraries**

### **1. React-PDF (v10.2.0)**
```typescript
import { Document, Page, pdfjs } from "react-pdf"
```

**Purpose**: Primary PDF rendering engine for React applications
**Key Features**:
- Built on top of PDF.js (Mozilla's PDF rendering engine)
- React component wrapper for PDF.js functionality
- Supports text layer and annotation layer control
- Canvas-based rendering for high-quality display

**DRM Integration**:
```typescript
<Page 
  pageNumber={index + 1} 
  renderTextLayer={false}    // ← Disables text selection/copy
  renderAnnotationLayer={false}  // ← Disables interactive elements
  width={800}
  className="rounded-lg"
/>
```

**Security Benefits**:
- `renderTextLayer={false}` prevents text selection and copy operations
- `renderAnnotationLayer={false}` disables clickable links and form fields
- Canvas rendering makes OCR more difficult than DOM text

### **2. PDF.js (Mozilla) - Underlying Engine**
```typescript
// Worker configuration for Next.js
pdfjs.GlobalWorkerOptions.workerSrc = 
  `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
```

**Purpose**: Core PDF parsing and rendering engine
**Key Features**:
- JavaScript-based PDF parser (no plugins required)
- Web Worker support for performance
- Canvas-based rendering
- Cross-browser compatibility

**Technical Details**:
- **Version**: Automatically matches react-pdf version
- **Worker**: Runs PDF parsing in separate thread
- **CDN Delivery**: Loaded from unpkg.com for reliability
- **Format**: ES modules (.mjs) for modern browsers

## 🎨 **Watermarking Technologies**

### **1. SVG-Based Background Watermarks**
```typescript
backgroundImage: `url("data:image/svg+xml,%3Csvg width='${spacing}' height='${spacing}' 
xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50%25' y='50%25' 
font-family='Inter,sans-serif' font-size='10' font-weight='300' 
fill='%23718096' text-anchor='middle' 
transform='rotate(-45 ${spacing/2} ${spacing/2})'%3E${email}%3C/text%3E%3C/svg%3E")`
```

**Technology**: Inline SVG with Data URLs
**Advantages**:
- **Vector-based**: Scales perfectly at any zoom level
- **Lightweight**: No external image files required
- **Dynamic**: Generated with user data in real-time
- **Secure**: Cannot be easily removed or blocked

**Technical Implementation**:
- **Encoding**: URL-encoded SVG embedded in CSS
- **Positioning**: CSS background-repeat for tiling
- **Rotation**: SVG transform for diagonal text
- **Typography**: Web-safe fonts (Inter, sans-serif fallback)

### **2. CSS-Based Overlay Watermarks**
```typescript
<div 
  className="absolute inset-0 flex items-center justify-center pointer-events-none"
  style={{ opacity: watermarkIntensity * 0.6 }}
>
  <div 
    className="text-xs font-light text-gray-400 bg-white/30 px-2 py-1 rounded backdrop-blur-sm"
    style={{ 
      transform: `rotate(-${rotation}deg) translate(${offset}px, ${offset}px)` 
    }}
  >
    {userEmail} • Page {pageNumber}
  </div>
</div>
```

**Technology**: CSS Transforms + Backdrop Filters
**Features**:
- **Dynamic positioning**: JavaScript-controlled transforms
- **Backdrop blur**: CSS backdrop-filter for subtle background
- **Responsive opacity**: Adjusts based on risk scoring
- **Pointer events disabled**: Doesn't interfere with user interaction

### **3. HTML Data Attributes (Steganographic)**
```typescript
<div 
  style={{ display: 'none' }}
  data-user-email={userInfo?.email}
  data-user-phone={userInfo?.phone}
  data-license-key={userInfo?.userId}
  data-ip-address={userInfo?.realIP}
  data-session={userInfo?.sessionId}
  data-timestamp={userInfo?.timestamp}
  data-item={itemId}
  data-risk-score={riskScore}
/>
```

**Technology**: Hidden HTML5 Data Attributes
**Purpose**: Forensic identification that survives visual tampering
**Benefits**:
- **Invisible to users**: Display: none hides from view
- **Survives screenshots**: Embedded in DOM structure
- **Machine readable**: Can be extracted programmatically
- **Legal evidence**: Provides audit trail for violations

## 🔒 **Security & DRM Libraries**

### **1. Browser APIs for Security Detection**
```typescript
// Screen recording detection
const mediaDevices = navigator.mediaDevices
const originalGetDisplayMedia = mediaDevices.getDisplayMedia
mediaDevices.getDisplayMedia = function(...args) {
  // Detection logic here
  return originalGetDisplayMedia.apply(this, args)
}

// Developer tools detection
const detectDevTools = () => {
  const threshold = 160
  if (window.outerHeight - window.innerHeight > threshold || 
      window.outerWidth - window.innerWidth > threshold) {
    // DevTools detected
  }
}
```

**APIs Used**:
- **MediaDevices API**: Screen recording detection
- **Window dimensions**: Developer tools detection
- **Visibility API**: Tab switching detection
- **Event listeners**: Keyboard/mouse interaction monitoring

### **2. React State Management for Security**
```typescript
const [riskScore, setRiskScore] = useState(0)
const [watermarkIntensity, setWatermarkIntensity] = useState(0.08)
const [isRecordingDetected, setIsRecordingDetected] = useState(false)
```

**Technology**: React Hooks (useState, useEffect)
**Purpose**: Real-time security state management
**Features**:
- **Risk scoring**: Dynamic threat assessment
- **Adaptive watermarking**: Intensity based on behavior
- **Real-time monitoring**: Continuous security evaluation

## 🎨 **UI/UX Libraries**

### **1. Tailwind CSS (v4.1.9)**
```typescript
className="flex h-screen bg-gray-50"
className="w-80 bg-white border-r border-gray-200 shadow-sm"
className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
```

**Purpose**: Utility-first CSS framework
**DRM Benefits**:
- **Responsive design**: Works on all screen sizes
- **Professional styling**: Enterprise-grade appearance
- **Performance**: Purged CSS for minimal bundle size
- **Consistency**: Standardized design system

### **2. Lucide React (v0.454.0)**
```typescript
import { Loader2, AlertTriangle, FileText, Shield, Activity } from "lucide-react"
```

**Purpose**: Modern icon library for React
**Features**:
- **SVG-based**: Scalable vector icons
- **Tree-shakable**: Only imports used icons
- **Consistent design**: Professional icon set
- **Accessibility**: Proper ARIA attributes

### **3. Framer Motion (v12.23.25)**
```typescript
import { motion } from "framer-motion"

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
```

**Purpose**: Animation library for React
**DRM Usage**:
- **Smooth transitions**: Professional watermark movement
- **Loading animations**: Better user experience
- **Micro-interactions**: Enhanced UI feedback

## 🗄️ **Backend & Data Libraries**

### **1. Supabase (Latest)**
```typescript
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()
await supabase.from('activity_logs').insert({
  user_id: user.id,
  action: `Risk Event: ${action}`,
  details: { /* forensic data */ }
})
```

**Purpose**: Backend-as-a-Service for authentication and data
**DRM Features**:
- **Real-time logging**: Activity monitoring
- **Secure authentication**: User verification
- **File storage**: Protected PDF hosting
- **Row Level Security**: Data access control

### **2. Next.js (v16.0.7)**
```typescript
// Server-side authentication
import { createClient } from "@/lib/supabase/server"

export default async function ReaderPage({ params }) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
}
```

**Purpose**: React framework with SSR/SSG capabilities
**Security Benefits**:
- **Server-side auth**: Secure user verification
- **API routes**: Protected file serving
- **Middleware**: Request filtering and logging
- **Static generation**: Performance optimization

## 🔧 **Development & Build Tools**

### **1. TypeScript (v5)**
```typescript
interface UserInfo {
  email: string
  fullName: string
  userId: string
  phone: string
  ipAddress: string
  timestamp: string
  deviceInfo: string
  sessionId: string
  realIP: string
}
```

**Purpose**: Type-safe JavaScript development
**Benefits**:
- **Type safety**: Prevents runtime errors
- **IntelliSense**: Better development experience
- **Refactoring**: Safe code changes
- **Documentation**: Self-documenting interfaces

### **2. PostCSS & Autoprefixer**
```css
/* Automatically adds vendor prefixes */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}
```

**Purpose**: CSS processing and optimization
**Features**:
- **Vendor prefixes**: Cross-browser compatibility
- **CSS optimization**: Minification and purging
- **Modern CSS**: Support for latest features

## 📊 **Performance & Monitoring**

### **1. Vercel Analytics**
```typescript
import { Analytics } from '@vercel/analytics/react'
```

**Purpose**: Performance monitoring and user analytics
**DRM Benefits**:
- **Usage tracking**: Monitor content access patterns
- **Performance metrics**: Optimize loading times
- **User behavior**: Understand interaction patterns

### **2. Lighthouse (v12.8.2)**
```json
"test:lighthouse": "lighthouse http://localhost:3000 --preset=desktop"
```

**Purpose**: Performance auditing and optimization
**Metrics Tracked**:
- **Performance**: Loading speed optimization
- **Accessibility**: WCAG compliance
- **Best practices**: Security and UX standards
- **SEO**: Search engine optimization

## 🔐 **Security Architecture Summary**

### **Multi-Layer Protection Stack**:
1. **PDF.js Layer**: Disables text selection and annotations
2. **React Layer**: Component-level access control
3. **CSS Layer**: Visual watermarking and styling
4. **JavaScript Layer**: Behavioral monitoring and detection
5. **DOM Layer**: Hidden forensic data attributes
6. **Server Layer**: Authentication and file protection
7. **Database Layer**: Activity logging and audit trails

### **Real-time Monitoring Pipeline**:
```
User Action → Event Detection → Risk Scoring → Watermark Adjustment → Database Logging → Legal Evidence
```

### **Forensic Data Chain**:
```
Visible Watermarks → Hidden DOM Data → Server Logs → Database Records → Legal Documentation
```

This comprehensive technical stack provides enterprise-grade PDF protection with forensic-level traceability while maintaining excellent user experience and performance.