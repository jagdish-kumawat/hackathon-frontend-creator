# Voice Agent Creator Portal

A comprehensive Next.js application for designing, configuring, and simulating modular voice agent pipelines. This is a pure frontend application with no backend dependencies, featuring a complete creator/management portal for voice agents with STT (Speech-to-Text) → LLM (Large Language Model) → TTS (Text-to-Speech) pipelines.

## 🚀 Features

### ✨ Core Functionality

- **Microsoft Entra ID Authentication**: Secure enterprise authentication with mock provider for development
- **Landing Page**: Beautiful marketing page with authentication flow
- **Agent Creation Wizard**: Step-by-step agent configuration with intuitive forms
- **Visual Pipeline Editor**: React Flow-based canvas for designing voice agent workflows
- **Mock Simulation Engine**: Local simulation of voice agent conversations without external APIs
- **Template Gallery**: Pre-built agent templates for common use cases (Healthcare, Support, etc.)
- **Import/Export**: Save and share agent configurations as JSON files
- **State Management**: Persistent storage using Zustand and IndexedDB

### 🎨 User Experience

- **Authentication Flow**: Secure login/logout with user profile display
- **Landing Page**: Professional marketing page highlighting key features
- **Protected Routes**: Dashboard and tools accessible only after authentication
- **Dual Themes**: Beautiful light and dark mode with instant switching
- **Command Palette**: Quick access to actions with ⌘K/Ctrl+K
- **Responsive Design**: Mobile-first design that works on all devices
- **Accessibility**: WCAG-compliant with keyboard navigation support
- **Micro-interactions**: Smooth animations with Framer Motion

### 🔧 Technical Stack

- **Framework**: Next.js 15+ with App Router and TypeScript
- **Styling**: Tailwind CSS with custom design tokens
- **Components**: shadcn/ui (Radix primitives)
- **State**: Zustand with Immer and persistence
- **Forms**: React Hook Form with Zod validation
- **Pipeline Editor**: React Flow
- **Icons**: Lucide React
- **Animations**: Framer Motion

## 📋 Prerequisites

- Node.js 18+
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd voice-agent-creator
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure Authentication (Optional)**

   For production with real Microsoft Entra ID:

   ```bash
   cp .env.local.example .env.local
   ```

   Update `.env.local` with your Azure App Registration values:

   ```
   NEXT_PUBLIC_AZURE_CLIENT_ID=your-azure-client-id
   NEXT_PUBLIC_AZURE_TENANT_ID=your-azure-tenant-id
   ```

   For development, the app includes a mock authentication provider that simulates Microsoft login.

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## � Authentication

The application supports Microsoft Entra ID authentication with two modes:

### Development Mode (Default)

- Uses mock authentication provider
- Simulates Microsoft login flow
- No external API calls required
- User data persisted in localStorage

### Production Mode

- Real Microsoft Entra ID integration
- Requires Azure App Registration
- Configure environment variables
- Enterprise-grade security

### Setup Azure App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to Azure Active Directory > App registrations
3. Create a new registration
4. Configure redirect URI: `http://localhost:3000` (development)
5. Note the Application (client) ID and Directory (tenant) ID
6. Update `.env.local` with these values

## �📖 Usage Guide

### Getting Started

1. **Landing Page**: Visit the application to see the marketing page
2. **Sign In**: Click "Sign in with Microsoft" (uses mock auth in development)
3. **Dashboard**: Access the main dashboard after authentication

### Creating Your First Agent

1. **Navigate to Dashboard**: Start from the main dashboard
2. **Click "New Agent"**: Use the prominent creation button
3. **Follow the Wizard**:
   - Enter basic information (name, description, domain)
   - Choose a template or start from scratch
   - Select STT, LLM, and TTS adapters
   - Configure prompts and policies
   - Review and create

### Using the Playground

1. **Go to Playground**: Navigate via the sidebar
2. **Select an Agent**: Choose from your created agents or use mock
3. **Start Recording**: Click the record button for simulated input
4. **Watch the Pipeline**: Observe real-time processing steps
5. **View Results**: See transcription, response, and audio waveform

### Managing Agents

- **View All Agents**: Browse your collection with search and filters
- **Edit Agents**: Click edit to modify configurations
- **Export/Import**: Save agents as JSON files for sharing
- **Templates**: Use pre-built templates from the gallery

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (dashboard)/        # Dashboard home
│   ├── agents/            # Agent management
│   ├── gallery/           # Template gallery
│   ├── playground/        # Testing interface
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Base UI components (shadcn)
│   ├── dashboard/        # Dashboard-specific components
│   ├── agents/           # Agent management components
│   ├── gallery/          # Template gallery components
│   └── playground/       # Testing interface components
├── lib/                  # Utility functions
│   ├── utils.ts          # General utilities
│   ├── simulators.ts     # Mock simulation engine
│   └── theme.ts          # Theme utilities
├── store/                # Zustand state management
│   └── agents.ts         # Main application store
├── types/                # TypeScript type definitions
│   └── agents.ts         # Core type definitions
└── fixtures/             # Mock data and templates
```

## 🔄 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🎯 Key Components

### Agent Types

All agents follow a standardized configuration schema with:

- **Pipeline Nodes**: STT, LLM, TTS, Tool, Transform components
- **Adapter Configs**: Pluggable configurations for each component
- **Prompts**: System prompts and tool definitions
- **Policies**: PII redaction, language settings, latency budgets

### Simulation Engine

The mock simulation engine provides:

- **STT Simulation**: Progressive transcription with confidence scores
- **LLM Simulation**: Token streaming with contextual responses
- **TTS Simulation**: Audio waveform generation for visualization
- **Performance Metrics**: Latency tracking and success rates

### State Management

Zustand stores manage:

- **Agents**: CRUD operations and current selection
- **Adapters**: Available adapter configurations
- **Simulation**: Session management and metrics
- **UI State**: Theme, notifications, and interface state
- **Workspace**: Settings and preferences

## 🔒 Security & Privacy

- **No External APIs**: All simulation is local and mock-only
- **No Secrets**: No API keys or sensitive data required
- **PII Protection**: Built-in redaction toggles and warnings
- **Local Storage**: All data stays in your browser via IndexedDB

## 🎨 Customization

### Themes

- Modify CSS custom properties in `globals.css`
- Update Tailwind config for custom colors
- Use the built-in theme builder for visual customization

### Adapters

- Add new adapter configurations in the store
- Define custom simulation functions
- Create adapter-specific UI forms with Zod schemas

### Templates

- Add new agent templates in the gallery component
- Define domain-specific configurations
- Include sample prompts and example interactions

## 🚫 Limitations

- **Frontend Only**: No real STT/LLM/TTS integration
- **Mock Simulation**: All voice processing is simulated
- **No Real APIs**: No external service calls or deployments
- **Browser Storage**: Data persistence is limited to local browser storage

## 🔮 Future Enhancements

- Real adapter integrations with proper backend
- Advanced pipeline validation and testing
- Collaborative agent development
- Analytics and performance monitoring
- Voice agent deployment automation

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Support

For questions or issues:

- Check the in-app documentation
- Review the type definitions in `src/types/`
- Examine the simulation engine in `src/lib/simulators.ts`

---

**Note**: This is a frontend-only sandbox application. Do not use real PII or sensitive data. All voice processing is simulated for demonstration purposes.
