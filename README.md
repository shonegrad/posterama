# Posterama

Posterama is a browser-based image processing tool designed for creating poster-style art using dithering and pattern effects. It allows users to transform images into visually striking, "posterized" versions directly in the browser, with a focus on privacy and speed.

[**Live Demo**](https://shonegrad.github.io/posterama/)

## Features

- **Client-Side Processing**: All image manipulation happens in your browser. No images are uploaded to any server.
- **Dithering Effects**: Apply various dithering algorithms to create retro and artistic textures.
- **Pattern Overlays**: Use halftone patterns and other overlays to enhance the poster aesthetic.
- **Preset Management**: Save and load your favorite effect combinations.
- **High-Quality Export**: Export your creations in PNG format.

## Quickstart

### Prerequisites
- **Node.js**: v18 (LTS) or higher is recommended.
- **npm**: Comes with Node.js.

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/shonegrad/posterama.git
    cd posterama
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Development

Start the local development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal) to view the app.

### Build and Preview

To create a production build:
```bash
npm run build
```

To preview the production build locally:
```bash
npm run preview
```

## Project Structure

```
src/
├── app/          # App shell and main layout
├── components/   # Reusable UI components
├── features/     # Feature-specific modules (image processing, presets)
├── hooks/        # Shared React hooks
├── lib/          # Helper functions and utilities
├── styles/       # Global styles and CSS
└── assets/       # Static assets
docs/             # Project documentation
public/           # Public assets (favicons, examples)
```

## Contributing

We welcome contributions! Please check out our [Contributing Guide](CONTRIBUTING.md) for details on how to get started.

For security concerns, please review our [Security Policy](SECURITY.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.