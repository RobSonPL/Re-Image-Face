
import { HeadshotStyle, StyleConfig, BackgroundId, BackgroundConfig } from './types';

// STRIPE CONFIGURATION - REMOVED

export const STYLES: Record<HeadshotStyle, StyleConfig> = {
  [HeadshotStyle.CORPORATE]: {
    id: HeadshotStyle.CORPORATE,
    title: 'Corporate Classic',
    description: 'Professional, trustworthy, and polished. Ideal for LinkedIn and company websites.',
    promptModifier: 'Transform this person into a professional corporate headshot. They should be wearing a sharp business suit (navy or charcoal). Lighting should be even and flattering, high-key photography style. Maintain facial features but improve skin texture slightly.',
    iconColor: 'bg-blue-100 text-blue-600',
  },
  [HeadshotStyle.CREATIVE]: {
    id: HeadshotStyle.CREATIVE,
    title: 'Creative Professional',
    description: 'Modern, approachable, and artistic. Perfect for designers, marketers, and startups.',
    promptModifier: 'Transform this person into a creative professional headshot. They should be wearing smart-casual attire (e.g., blazer with t-shirt, or stylish shirt). Lighting should be natural and warm.',
    iconColor: 'bg-purple-100 text-purple-600',
  },
  [HeadshotStyle.EXECUTIVE]: {
    id: HeadshotStyle.EXECUTIVE,
    title: 'Executive Portrait',
    description: 'Authoritative, sophisticated, and high-end. Best for leadership roles and press kits.',
    promptModifier: 'Transform this person into a high-end executive portrait. They should be wearing a premium dark tailored suit. Lighting should be dramatic, cinematic lighting (rembrandt style). The mood is confident and authoritative.',
    iconColor: 'bg-slate-800 text-white',
  },
  [HeadshotStyle.SEXY]: {
    id: HeadshotStyle.SEXY,
    title: 'Sexy Model',
    description: 'Bold, confident, and magnetic. High-fashion energy.',
    promptModifier: 'Transform this person into a charismatic, confident model-style portrait. They should be wearing stylish, attractive clothing. The lighting should be dramatic and high-contrast fashion lighting. The mood is alluring and bold. Focus on a captivating gaze.',
    iconColor: 'bg-pink-100 text-pink-600',
  },
  [HeadshotStyle.SENSUAL]: {
    id: HeadshotStyle.SENSUAL,
    title: 'Soft & Mood',
    description: 'Gentle, warm, and emotive. Focus on connection.',
    promptModifier: 'Transform this person into a soft, atmospheric portrait. They should be wearing soft textures. The lighting should be golden hour, warm, and diffuse. The expression is gentle, intimate, and inviting.',
    iconColor: 'bg-rose-100 text-rose-600',
  },
  [HeadshotStyle.EROTIC]: {
    id: HeadshotStyle.EROTIC,
    title: 'Erotic Mood',
    description: 'Intimate, provocative, and artistic boudoir style.',
    promptModifier: 'Transform this person into an artistic erotic portrait. Boudoir photography style. High contrast, moody lighting, silk or lace textures. The atmosphere is intimate and seductive. Focus on beauty and allure.',
    iconColor: 'bg-red-100 text-red-600',
  },
  [HeadshotStyle.MEDITATION]: {
    id: HeadshotStyle.MEDITATION,
    title: 'Mindful Zen',
    description: 'Peaceful, calm, and grounded. Ideal for wellness.',
    promptModifier: 'Transform this person into a peaceful meditation portrait. They should be wearing light, comfortable organic clothing. The expression is calm, serene, and mindful.',
    iconColor: 'bg-teal-100 text-teal-600',
  },
  [HeadshotStyle.GLAMOROUS]: {
    id: HeadshotStyle.GLAMOROUS,
    title: 'Hollywood Glamour',
    description: 'High-contrast, elegant, and red-carpet ready.',
    promptModifier: 'Transform this person into a glamorous hollywood style portrait. They should be wearing elegant evening wear. The lighting should be dramatic, high-contrast studio lighting with a spotlight effect. The skin should look flawless and glowing.',
    iconColor: 'bg-yellow-100 text-yellow-600',
  },
  [HeadshotStyle.VINTAGE]: {
    id: HeadshotStyle.VINTAGE,
    title: 'Timeless Vintage',
    description: 'Retro 50s/60s aesthetic with classic film grain.',
    promptModifier: 'Transform this person into a vintage portrait from the 1950s or 60s. Apply a classic film look with slight grain. They should be wearing retro fashion (e.g., tweed, pearls, or classic collars). The lighting should be soft classic studio style. Color grading should be slightly desaturated or sepia-toned.',
    iconColor: 'bg-amber-100 text-amber-700',
  },
  [HeadshotStyle.FUTURISTIC]: {
    id: HeadshotStyle.FUTURISTIC,
    title: 'Cyber Future',
    description: 'Sleek, neon-lit, and cutting-edge.',
    promptModifier: 'Transform this person into a futuristic cyberpunk portrait. They should be wearing sleek, modern tech-wear or metallic accents. The lighting should involve neon colors (cyan and magenta) and be dramatic.',
    iconColor: 'bg-cyan-100 text-cyan-600',
  },
  [HeadshotStyle.CYBERPUNK]: {
    id: HeadshotStyle.CYBERPUNK,
    title: 'Cyberpunk',
    description: 'High-tech, low-life aesthetic with vibrant neon lights.',
    promptModifier: 'Transform this person into a cyberpunk character. High-tech cybernetic implants or visors (optional but stylish). The lighting is harsh neon pink, purple, and blue. Gritty but stylish atmosphere.',
    iconColor: 'bg-fuchsia-100 text-fuchsia-600',
  },
  [HeadshotStyle.ART_DECO]: {
    id: HeadshotStyle.ART_DECO,
    title: 'Art Deco',
    description: 'The roaring 20s. Gold, geometric, and opulent.',
    promptModifier: 'Transform this person into an Art Deco masterpiece portrait. The style is reminiscent of the Great Gatsby or 1920s luxury posters. Use gold, black, and geometric patterns. The person should look elegant and wealthy. Lighting is sharp and angular.',
    iconColor: 'bg-orange-100 text-orange-600',
  },
  [HeadshotStyle.FANTASY]: {
    id: HeadshotStyle.FANTASY,
    title: 'High Fantasy',
    description: 'Ethereal, magical, and heroic RPG style.',
    promptModifier: 'Transform this person into a high fantasy character portrait. They could be an elf, mage, or noble. Wearing intricate robes or light armor. The lighting is magical and ethereal, with soft glows. Dreamy and epic quality.',
    iconColor: 'bg-emerald-100 text-emerald-600',
  },
  [HeadshotStyle.SCIFI]: {
    id: HeadshotStyle.SCIFI,
    title: 'Space Sci-Fi',
    description: 'Clean, interstellar explorer aesthetic.',
    promptModifier: 'Transform this person into a sci-fi space explorer. Wearing a clean, futuristic space fleet uniform (Star Trek style or similar). Lighting is cool white and blue. Clean, sharp, and professional future look.',
    iconColor: 'bg-indigo-100 text-indigo-500',
  },
  [HeadshotStyle.STEAMPUNK]: {
    id: HeadshotStyle.STEAMPUNK,
    title: 'Steampunk',
    description: 'Victorian industrial with brass gears and steam.',
    promptModifier: 'Transform this person into a steampunk character. Wearing Victorian-era clothing with brass goggles, leather gears, and mechanical accessories. Lighting is warm, brassy, and sepia-toned.',
    iconColor: 'bg-stone-200 text-stone-700',
  },
  [HeadshotStyle.THREED]: {
    id: HeadshotStyle.THREED,
    title: '3D Render',
    description: 'Cute, expressive, and high-quality 3D character style.',
    promptModifier: 'Transform this person into a high-quality 3D character render, similar to Pixar or Dreamworks animation. Smooth textures, large expressive eyes, soft studio lighting. The character should look cute and vibrant.',
    iconColor: 'bg-lime-100 text-lime-600',
  },
  [HeadshotStyle.ICE_AGE]: {
    id: HeadshotStyle.ICE_AGE,
    title: 'Ice Age',
    description: 'Frozen, frosty, and cinematic winter aesthetic.',
    promptModifier: 'Transform this person into a cinematic Ice Age themed portrait. Frost on hair and eyelashes, thick winter furs. The lighting is cold blue and crisp. Background suggests a frozen tundra or ice cave.',
    iconColor: 'bg-cyan-50 text-cyan-500',
  },
  [HeadshotStyle.ARTISTIC_PAINTING]: {
    id: HeadshotStyle.ARTISTIC_PAINTING,
    title: 'Artistic Painting',
    description: 'Classic oil painting aesthetic with rich textures.',
    promptModifier: 'Transform this person into a beautiful artistic painting portrait. Oil painting style with visible brush strokes, rich colors, and artistic lighting. The texture should look like canvas.',
    iconColor: 'bg-orange-100 text-orange-600',
  },
};

export const BACKGROUNDS: BackgroundConfig[] = [
  {
    id: BackgroundId.ORIGINAL,
    label: 'Default / Original',
    promptModifier: '',
    previewColor: 'bg-gradient-to-br from-slate-100 to-slate-200'
  },
  {
    id: BackgroundId.STUDIO_GREY,
    label: 'Studio Grey',
    promptModifier: 'The background must be a clean, solid professional neutral grey studio backdrop.',
    previewColor: 'bg-[#808080]'
  },
  {
    id: BackgroundId.STUDIO_WHITE,
    label: 'Pure White',
    promptModifier: 'The background must be pure white (#FFFFFF), clean and shadowless.',
    previewColor: 'bg-white border border-slate-200'
  },
  {
    id: BackgroundId.OFFICE,
    label: 'Modern Office',
    promptModifier: 'The background must be a blurred, bright, modern open-plan office environment with glass walls and depth of field.',
    previewColor: 'bg-blue-50'
  },
  {
    id: BackgroundId.CITY_BOKEH,
    label: 'City Lights',
    promptModifier: 'The background must be a blurred night cityscape with beautiful bokeh lights.',
    previewColor: 'bg-slate-900'
  },
  {
    id: BackgroundId.NEW_YORK,
    label: 'New York City',
    promptModifier: 'The background must be a blurred, iconic New York City street scene with yellow cabs or skyscrapers.',
    previewColor: 'bg-amber-100'
  },
  {
    id: BackgroundId.BRICK_WALL,
    label: 'Loft Brick',
    promptModifier: 'The background must be a stylish white or distressed brick wall, loft style.',
    previewColor: 'bg-orange-50'
  },
  {
    id: BackgroundId.NATURE,
    label: 'Nature Blur',
    promptModifier: 'The background must be a soft, blurred green nature background with natural lighting.',
    previewColor: 'bg-green-100'
  },
  {
    id: BackgroundId.SHIP,
    label: 'Luxury Yacht',
    promptModifier: 'The background must be a sunny deck of a luxury cruise ship or yacht with blue ocean behind.',
    previewColor: 'bg-cyan-100'
  },
  {
    id: BackgroundId.AIRPORT,
    label: 'Airport Lounge',
    promptModifier: 'The background must be a modern, clean airport terminal or first-class lounge with large windows.',
    previewColor: 'bg-sky-50'
  },
  {
    id: BackgroundId.BOOKSHELF,
    label: 'Library / Books',
    promptModifier: 'The background must be a blurred library or bookshelf, suggesting intelligence and academia.',
    previewColor: 'bg-amber-900'
  },
  {
    id: BackgroundId.SOLID_BLUE,
    label: 'Corporate Blue',
    promptModifier: 'The background must be a solid, deep corporate blue.',
    previewColor: 'bg-blue-800'
  },
  {
    id: BackgroundId.STUDIO_BLACK,
    label: 'Studio Black',
    promptModifier: 'The background must be a solid, pitch black studio backdrop for dramatic contrast.',
    previewColor: 'bg-black'
  },
  {
    id: BackgroundId.EIFFEL_TOWER,
    label: 'Eiffel Tower',
    promptModifier: 'The background must be a blurred, romantic view of the Eiffel Tower in Paris with soft daylight.',
    previewColor: 'bg-sky-100'
  },
];
