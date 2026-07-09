# YT Thumbnail Face Swap Generator

A full-stack web app for swapping a portrait head into an uploaded YouTube thumbnail using the Gemini image preview model. Upload a thumbnail, upload a portrait/head image, add optional extra instructions, and generate a finished thumbnail preview that can be downloaded.

## Features

- Upload a base YouTube thumbnail image
- Upload a portrait/head source image
- Add optional extra instructions for style, lighting, expression, realism, or placement
- Generate a face-swapped thumbnail with `gemini-3-pro-image-preview`
- Preview both uploaded images before generation
- Display the generated result on the page
- Download the generated image
- Responsive plain HTML, CSS, and JavaScript frontend
- Node.js and Express backend with `multer` upload handling

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Create a `.env` file from the example:

```bash
cp .env.example .env
```

3. Add your Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

## Run

```bash
pnpm start
```

Then open:

```text
http://localhost:3000
```

## Usage

Choose a YouTube thumbnail as the base image, choose a portrait/head image as the face source, optionally write extra instructions, and click **Generate Face Swap**. The generated image will appear in the result area with a download button.

## Notes

Use this tool only with images you own or have permission to edit. Do not use it to impersonate people, mislead viewers, or create deceptive content.
