# HTIC Biomedical Knowledge Assistant

A beautiful, responsive medical chatbot frontend powered by Graph RAG technology for biomedical knowledge retrieval and question answering.

## 🌟 Features

- **🧬 Medical Knowledge Graph**: Powered by Graph RAG for accurate, evidence-based responses
- **📱 Responsive Design**: Beautiful UI that works on desktop, tablet, and mobile
- **🎨 Eye-Soothing Interface**: Dark theme with orange accents and textured backgrounds
- **⚡ Real-time Chat**: Interactive conversation with follow-up questions
- **📊 Context Visualization**: Shows processing time and entities used
- **💬 Sample Questions**: Pre-built medical questions to get started
- **🔄 Loading States**: Beautiful animations and progress indicators

## 🎨 Design Features

- **Color Palette**: Black/gray textured backgrounds with orange highlights
- **Typography**: Poppins font from Google Fonts
- **Animations**: Smooth transitions and loading animations
- **Mobile-First**: Responsive design with mobile sidebar overlay
- **Accessibility**: High contrast and keyboard navigation

## 🛠️ Setup Instructions

### Prerequisites

1. **Python Environment**: Ensure you have Python 3.8+ with the backend dependencies
2. **Node.js**: Version 16 or later
3. **Backend Setup**: Make sure the backend directory is properly configured

### Frontend Installation

1. **Navigate to the frontend directory**:
   ```bash
   cd graph-rag
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to `http://localhost:3000`

### Backend Integration

The frontend automatically connects to the Python backend located in the `../backend` directory. Ensure:

1. **Backend dependencies are installed**:
   ```bash
   cd ../backend
   pip install -r requirements.txt
   ```

2. **Knowledge base is set up**:
   - Ensure `essentials/all_chunks.json` exists
   - Ensure `essentials/knowledge_triplets.json` exists
   - Ensure the retrieval mechanisms are working

3. **Python environment is accessible**:
   The frontend uses Python subprocess to execute queries

## 📁 Project Structure

```
graph-rag/
├── pages/
│   ├── index.js              # Main chat interface
│   ├── _app.js              # App configuration
│   ├── _document.js         # Document structure
│   └── api/
│       ├── chat.js          # Chat API endpoint
│       └── health.js        # Health check endpoint
├── constants/
│   ├── colors.js            # Color palette
│   ├── theme.js             # Typography and spacing
│   └── index.js             # Exported constants
├── components/
│   └── UIComponents.js      # Reusable UI components
├── utils/
│   └── backend_adapter.py   # Python backend adapter
├── styles/
│   ├── globals.css          # Global styles
│   └── Home.module.css      # Component styles
└── public/                  # Static assets
```

## 🚀 Features in Detail

### Chat Interface
- **Real-time messaging** with typing indicators
- **Message history** with timestamps
- **Error handling** with user-friendly messages
- **Loading states** with animated indicators

### Mobile Experience
- **Responsive sidebar** that slides in/out on mobile
- **Touch-friendly buttons** and interactions
- **Optimized text sizes** for mobile reading
- **Swipe gestures** for sidebar control

### Backend Integration
- **Async processing** of medical queries
- **Error recovery** and retry mechanisms
- **Performance monitoring** with timing data
- **Context visualization** showing entities used

## 🔍 API Endpoints

### POST /api/chat
Process a medical query and return an answer.

**Request**:
```json
{
  "question": "What is pulse wave velocity?"
}
```

**Response**:
```json
{
  "answer": "Pulse wave velocity (PWV) is...",
  "processingTime": 2.34,
  "entitiesUsed": 5,
  "success": true
}
```

### GET /api/health
Health check endpoint for monitoring.

## 🎯 Usage Tips

1. **Start with sample questions** to understand the system capabilities
2. **Ask specific medical questions** for best results
3. **Use follow-up questions** to dive deeper into topics
4. **Check processing time** to understand query complexity
5. **View raw context** to see knowledge graph data

---

**Built with ❤️ using Next.js, React, and Graph RAG technology**
