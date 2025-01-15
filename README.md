# NOETHER

NOETHER is an AI-powered code editor and learning system that integrates knowledge graphs, AI, and intuitive learning paths to enhance the developer experience. Built for the Hypermode Knowledge Graph + AI Challenge.

## Features

- 🤖 AI-driven real-time code completion and error correction using Llama 3.1
- 📊 Dynamic knowledge graph visualization using Neo4j
- 🎓 Personalized learning paths and tutorials
- 🔍 Context-aware recommendations using GraphRAG
- 💻 VS Code-like editor experience with Monaco Editor
- 🚀 Built with Next.js, Node.js, and Neo4j

## Prerequisites

- Node.js >= 18
- Neo4j >= 5.0
- Modus API Key

## Installation

1. Clone the repository:
```bash
git clone https://github.com/okwareddevnest/noether.git
cd noether
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.dev.local.example .env.dev.local
```
Edit `.env.dev.local` with your configuration values.

4. Start Neo4j:
- Install Neo4j Desktop or use Neo4j AuraDB
- Create a new database
- Update the Neo4j connection details in `.env.dev.local`

5. Start the development server:
```bash
npm run dev
```

## Architecture

### Frontend
- Next.js for the React framework
- Monaco Editor for code editing
- D3.js for knowledge graph visualization
- React Force Graph for interactive graph rendering

### Backend
- Node.js with Express
- Neo4j for graph database
- Modus API for AI integration
- GraphRAG for context-aware retrieval

### AI Integration
- Llama 3.1 through Modus API
- Real-time code analysis
- Intelligent code completion
- Error detection and correction

### Knowledge Graph
- Concepts and relationships
- Code dependencies
- Learning paths
- User progress tracking

## Development

### Project Structure
```
noether/
├── src/
│   ├── client/
│   │   ├── components/
│   │   ├── pages/
│   │   └── styles/
│   ├── core/
│   │   ├── knowledge-graph/
│   │   └── services/
│   └── server/
├── public/
├── tests/
└── docs/
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run linter
- `npm run pretty` - Format code

## Testing

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- path/to/test

# Run tests in watch mode
npm test -- --watch
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built for the Hypermode Knowledge Graph + AI Challenge
- Uses Modus API for AI integration
- Powered by Neo4j graph database
- Monaco Editor for code editing
- D3.js for visualization 
