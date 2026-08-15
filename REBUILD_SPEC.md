# RateMyLips — Architectural & Rebuild Specification

This document provides the complete architectural breakdown, data structures, component hierarchy, UI/UX flows, and AI integration guidelines for the **RateMyLips** prototype to assist in rebuilding and scaling the application.

---

## 1. Code Purpose & Problem Solved

### Core Purpose
**RateMyLips** is a biometric aesthetic and clinical analysis platform designed for lip assessment, cosmetic scoring, and injection procedure planning.

### Problems Solved
- **Subjective Cosmetic Guesswork**: Eliminates ambiguous visual assessments by calculating objective geometric symmetry, Golden Ratio vertical proportions (1:1.618), vermilion border definition, and texture health.
- **Audit & Complication Prevention**: Provides an audit mode for filled lips to assess filler migration, unnatural projection ("duck lips" / "trout pout"), and textural unevenness.
- **Goal-Driven Procedure Blueprints**: Compares a user's anatomical scan against a reference goal ("Muse") to generate a clinical procedure blueprint complete with MD Codes (e.g., Lp1, Lp2, Lp4), suggested needle gauges, injection planes, and recommended filler volumes.

---

## 2. Key Components & Responsibilities

| File / Component | Type | Responsibility |
| :--- | :--- | :--- |
| **`App.tsx`** | Root Controller & View Router | Manages application state, multi-step navigation flow (`AppView`), image upload lifecycle (frontal, lateral, and muse), analysis timers, and global user data. |
| **`components/LipCropper.tsx`** | Interactive Canvas | HTML5 Canvas-based cropping tool providing pinch/zoom, pan/drag, and a pill-shaped ("tic-tac") cutout mask for standardizing lip captures. |
| **`components/ProfileView.tsx`** | Results & Blueprint Dashboard | Displays aesthetic ranking, Recharts **Radar Chart** (7-point symmetry/definition/vitality balance), diagnostic cards, and the interactive **Aesthetic Blueprint** tab with syringe vector overlays and practitioner manifests. |
| **`components/Leaderboard.tsx`** | Ranking & Directory | Dual-tab leaderboard displaying ranked clients (with scores and status tags) and certified *Aesthetic Architects* (clinicians with engineering ratings and portfolio links). |
| **`components/TestBench.tsx`** | Algorithm Sandbox | Aesthetic lab allowing real-time adjustment of geometric variables (lip height, symmetry, duck lip index, filler migration) against synthetic benchmark personas. |
| **`components/Button.tsx`** | UI Component | Reusable styled button component supporting primary, ghost, and outline variants. |
| **`services/imageAnalysis.ts`** | Pixel Processing Engine | Offscreen canvas processor calculating RGB luminance, zone contrast, left/right symmetry, top/bottom ratio, and texture noise. |
| **`services/scoringEngine.ts`** | Biometric Math & Blueprints | Calculates Golden Ratio matching, archetype classification, diagnostic indices, and generates procedural injection blueprints. |
| **`services/mockData.ts`** | Seed Data | Mock leaderboards, certified aesthetic architects, and baseline client profiles. |
| **`services/testSuite.ts`** | Benchmark Personas | Pre-configured synthetic personas for algorithm testing in the TestBench. |

---

## 3. Data Structures (`types.ts`)

### A. User Profile & State
```typescript
export type LipStatus = 'Natural' | 'Filled';

export interface UserProfile {
  id: string;
  email: string;
  fingerprint: string;
  nickname: string;
  location_city: string;
  location_country: string;
  country_code?: string;
  lip_image_url: string;
  face_image_url: string;
  side_lip_image_url?: string;
  side_face_image_url?: string;
  status: LipStatus;
  muse_image_url?: string;
  muse_lip_url?: string;
  muse_scoring_result?: ScoringResult;
  muse_match_score?: number;
  muse_blueprint?: ProcedureBlueprint;
  allow_full_face_public: boolean;
  score: number;
  rank: number;
  features?: LipFeatures;
  scoringResult?: ScoringResult;
  isCurrentUser?: boolean;
}

export type AppView = 
  | 'onboarding' 
  | 'uploadFront' 
  | 'cropFront' 
  | 'uploadSide' 
  | 'cropSide' 
  | 'analyzing' 
  | 'result' 
  | 'profile' 
  | 'leaderboard' 
  | 'uploadMuse' 
  | 'cropMuse';
```

### B. Biometric Feature Vector (`LipFeatures`)
```typescript
export interface LipFeatures {
  upper_lip_height: number;
  lower_lip_height: number;
  mouth_width: number;
  face_width: number;
  lip_area: number;
  lower_face_area: number;
  left_lip_area: number;
  right_lip_area: number;
  lower_lip_central_height: number;
  lateral_upper_height: number;
  cupid_bow_depth: number;
  cupid_bow_symmetry: number;
  corner_taper_ratio: number;
  philtrum_definition_index: number;
  vermilion_contrast_index: number;
  corner_uplift_angle_deg: number;
  border_sharpness_index: number;
  dryness_index: number;
  wrinkle_roughness: number;
  vertical_crease_density: number;
  glossiness_index: number;
  lumpy_texture_index: number;
  filler_migration_index: number;
  redness: number;
  color_uniformity: number;
  discoloration_index: number;
  pigmentation_saturation: number;
  gradient_smoothness_index: number;
  lip_to_lower_face_area_ratio: number;
  lip_projection_index: number;
  duck_lip_index: number;
  yaw_deviation_deg: number;
  pitch_deviation_deg: number;
  roll_deviation_deg: number;
  occlusion_fraction: number;
  blur_index: number;
}
```

### C. Clinical Blueprint & Injection Points
```typescript
export type InjectionTechnique = 'Linear Threading' | 'Bolus' | 'Fanning' | 'Retrograde' | 'Micro-droplets';
export type TissueLayer = 'Subcutaneous' | 'Submucosal' | 'Vermilion Border' | 'Intramuscular (Avoid)';

export interface InjectionPoint {
  id: string;
  x: number; // Percentage offset (0-100)
  y: number; // Percentage offset (0-100)
  mdCode: string; // e.g. "Lp1", "Lp2", "Lp4"
  label: string;
  description: string;
  intensity: number; // 0-1
  volume_ml: number;
  needle_gauge: string; // e.g. "30G", "32G (Ultra Fine)"
  technique: InjectionTechnique;
  plane: TissueLayer;
  suggested_material: string;
  angle_deg: number;
}

export interface ClinicalManifest {
  total_volume_estimate: number;
  primary_filler_brand: string;
  secondary_filler_brand?: string;
  estimated_duration_months: number;
  practitioner_notes: string;
  safety_warnings: string[];
  needle_kit_req: string[];
}

export interface ProcedureBlueprint {
  injectionPoints: InjectionPoint[];
  manifest: ClinicalManifest;
  primaryGoal: string;
  volumeDeltaScore: number;
  sideProfileAnalysis: {
    projectionStatus: string;
    eLineMatch: number;
  };
  simulation?: SimulationResult;
  generatedAt: string;
  safetyCheckPassed: boolean;
}
```

---

## 4. LLM / AI Integration Plan

### Current State
The prototype relies on client-side JavaScript canvas pixel heuristics (`analyzeImagePixels`) and deterministic formulas in `scoringEngine.ts`.

### Claude Vision (Multimodal) Integration Workflow
When rebuilding with Claude (e.g. Claude 3.5 Sonnet / Claude 3.7 Sonnet Vision):

1. **Visual Landmark Extraction**:
   - **Input**: Base64 data strings of cropped frontal and lateral images.
   - **System Prompt**: Act as a board-certified cosmetic plastic surgeon and aesthetic anatomist. Extract geometric ratios, vermilion border clarity, philtrum depth, and detect signs of filler migration or asymmetry.
   - **Expected Output**: Structured JSON conforming to the `LipFeatures` interface.

2. **Aesthetic Blueprint Generation**:
   - **Input**: Comparison payload between User `LipFeatures` and Goal Muse `LipFeatures`.
   - **Prompt**: Compute the necessary volumetric enhancements. Generate tailored practitioner clinical notes, select appropriate hyaluronic acid filler viscosity (G-prime), recommend needle gauges/cannulas, and flag anatomical safety zones (e.g., facial artery branching paths).
   - **Expected Output**: Structured JSON conforming to `ProcedureBlueprint`.

---

## 5. UI/UX Flow & User Interaction Hooks

```
[Onboarding: Select 'Natural' or 'Filled']
                    │
                    ▼
[Upload Front Image] ──► [Canvas Cropper (Pinch/Zoom/Pan with Pill Mask)]
                    │
                    ▼
[Upload Side Image]  ──► [Canvas Cropper (Profile Alignment)]
                    │
                    ▼
[Zonal Scanning Animation (5-step progressive readout)]
                    │
                    ▼
[Profile & Results Dashboard]
   ├─ Overview: Recharts Radar Chart + Diagnostic Tiles + Aesthetic Rank
   ├─ Goal Persona ("Muse"): Upload reference target to generate MD injection map
   └─ Bottom Nav: Toggle between "Ranks" (Leaderboard) and "Me" (Active Profile)
```

---

## 6. Dependencies & External Libraries

- **`react` & `react-dom` (v19)**: Core rendering library.
- **`lucide-react`**: Specialized aesthetic and clinical vector icons (`Syringe`, `Crosshair`, `Activity`, `Radar`, `Trophy`, `ShieldCheck`).
- **`recharts`**: Renders the dynamic 7-axis `<RadarChart>` polygon on the profile overview.
- **`tailwindcss`**: Dark luxury aesthetic (`#0f172a` slate dark canvas, `#e11d48` rose primary, `#f59e0b` amber accents).
- **`vite`**: Build tool and development server.

---

## 7. Pain Points & Rebuild Recommendations

1. **Dynamic Landmark Detection**: Replace static baseline constants in `extractFeaturesFromImage()` with actual Claude Vision multimodal API analysis.
2. **Dynamic 2D/3D Injection Coordinates**: Calculate injection point coordinate percentages (`x`, `y`) relative to the detected anatomical landmarks rather than fixed offsets.
3. **High-DPI Canvas Rendering**: Scale internal canvas dimensions in `LipCropper.tsx` by `window.devicePixelRatio` to prevent blurriness on Retina displays.
4. **Cloud / Local Persistence**: Implement persistent storage (`localStorage` or cloud database) so scans, rankings, and blueprints persist across page reloads.
5. **PDF / Image Export**: Enable real export functionality for the "Clinical Manifest" so users and practitioners can download the generated blueprint.
