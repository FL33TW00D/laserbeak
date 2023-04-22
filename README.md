<div align="center">
<img width="600px" height="200px" src="https://github.com/FL33TW00D/laserbeak/raw/master/.github/Laserbeak.png">
</div>
<h1 align="center">Transformers in the Browser</h1>

Laserbeak enables developers to run transformer models in the browser/Electron using WebGPU.

It is designed to efficiently manage models by caching them in IndexedDB and sharing weights between encoder-decoder models for optimal performance. To see what it can do, check out our [example site](summize.fleetwood.dev).

## 🌟 Features

-   Run transformer models in the browser using WebGPU
-   Built on top of a custom Rust runtime for performance
-   Efficient model management with caching and weight sharing
-   Easy-to-use API for loading and running models

## ⚡️ Quick start

Install Laserbeak using npm:

```bash
npm i laserbeak
```

## 📚 Usage

Here's a simple example of how to load and run a model using Laserbeak:

```typescript
import {
    SessionManager,
    AvailableModels,
    InferenceSession,
} from "@rumbl/laserbeak";

//Create a SessionManager instance
let manager = new SessionManager();

//Load a model with a callback for when it's loaded
let modelSession = await manager.loadModel(AvailableModels.FLAN_T5_BASE, () =>
    console.log("Loaded successfully!")
);

// Run the model with a prompt and handle the output
await session.run(prompt, (output: string) => {
    // Process the model output
    console.log(output);
});
```

## 🚀 Roadmap

Laserbeak is still a _pre_pre_alpha_ project, here's our roadmap:

-   [ ] F16 support 
-   [ ] Shader optimizations 
-   [ ] Expanded model support (Whisper, UNet)
-   [ ] Unannounced features 🤫
-   [ ] INT8, INT4 support 

Stay tuned for exciting updates!

## 💪 Contributing

We welcome contributions to Laserbeak!
