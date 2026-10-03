export type FieldType = 'text' | 'image' | 'qr';

export type TextAlignment = 'left' | 'center' | 'right';
export type FontWeight = '400' | '500' | '600' | '700' | '800' | '900';
export type FontStyle = 'normal' | 'italic';
export type TextTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize';
export type ImageShape = 'rect' | 'circle' | 'rounded';

export interface TemplateField {
  id: string;
  name: string;             // User friendly label (e.g. "Recipient Name")
  key: string;              // Maps to person data: 'name' | 'title' | 'date' | 'code' | 'company' | 'email' | 'photo' | 'qr' | custom
  type: FieldType;
  
  // Coordinates as percentage (0 to 100) of template width/height for seamless scaling
  x: number;
  y: number;
  width: number;            // Percentage width of the container/wrap boundary
  height?: number;          // For image/qr shapes (percentage)
  
  // Typography
  fontFamily: string;
  fontSize: number;         // Base font size in px at 1000px width reference
  fontWeight: FontWeight;
  fontStyle: FontStyle;
  color: string;
  textAlign: TextAlignment;
  textTransform: TextTransform;
  letterSpacing: number;    // in px
  lineHeight: number;       // multiplier, e.g. 1.2
  
  // Effects & Styling
  opacity: number;          // 0 to 1
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  
  // Pill / Background container (useful for readability)
  hasBackground?: boolean;
  backgroundColor?: string;
  borderRadius?: number;
  paddingX?: number;
  paddingY?: number;
  borderWidth?: number;
  borderColor?: string;
  
  // For image/photo/avatar
  imageShape?: ImageShape;
  
  // Optional prefix / suffix
  prefix?: string;          // e.g. "CERTIFICATE ID: "
  suffix?: string;
  
  // Z-index layer order
  zIndex: number;
}

export interface Template {
  id: string;
  name: string;
  category: 'certificate' | 'badge' | 'voucher' | 'custom';
  imageUrl: string;
  naturalWidth: number;
  naturalHeight: number;
  fields: TemplateField[];
  createdAt: number;
}

export interface PersonRecord {
  id: string;
  name: string;
  title: string;          // Role, award title, or designation
  date: string;           // Issue date or event date
  code: string;           // Serial number, certificate ID, badge ticket code
  company: string;        // Organization, institution, or sponsor
  email: string;
  photoUrl?: string;      // Avatar / portrait URL or base64
  customFields?: Record<string, string>;
  isSelected: boolean;
}

export interface BatchExportProgress {
  total: number;
  current: number;
  currentPersonName: string;
  isGenerating: boolean;
  isCompleted: boolean;
  zipBlob?: Blob;
  downloadUrl?: string;
  error?: string;
}
