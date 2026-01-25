"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "es";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const translations = {
    en: {
        // Auth
        "login_title": "Login to continue",
        "login_subtitle": "Use your email to continue",
        "signup_title": "Create an account",
        "signup_subtitle": "Use your email to continue",
        "email_placeholder": "Email",
        "password_placeholder": "Password",
        "fullname_placeholder": "Full name",
        "continue": "Continue",
        "dont_have_account": "Don't have an account?",
        "already_have_account": "Already have an account?",
        "sign_up": "Sign up",
        "sign_in": "Sign in",
        "invalid_credentials": "Invalid email or password",
        "logged_in": "Logged in successfully",
        "registration_successful": "Registration Successful!",
        "check_email_confirm": "Check your email to confirm your account",
        "confirmation_email_sent": "We've sent a confirmation email to",
        "check_inbox_activate": "Please check your inbox and click the confirmation link to activate your account.",
        "go_to_signin": "Go to Sign In",

        // Dashboard
        "my_templates": "My Templates",
        "create_template": "Create a new template",
        "search_placeholder": "Search templates...",
        "open_in_editor": "Open in Editor",
        "pixels": "pixels",
        "save_preview": "Save to generate preview",
        "delete_project": "Delete project",
        "delete_project_confirm": "Are you sure you want to delete this project?",
        "delete": "Delete",
        "cancel": "Cancel",
        "edit": "Edit",
        "copy": "Make a copy",
        "copy_postfix": " - Copy",
        "api_integration": "API Integration",

        // Templates Section
        "start_from_template": "Start from a template",
        "popular": "Popular",
        "social_media": "Social Media",
        "presentations": "Presentations",
        "documents": "Documents",
        "business_marketing": "Business & Marketing",
        "print_documents": "Print & Documents",
        "custom_size": "Custom Size",
        "define_dimensions": "Define dimensions",
        "choose_preset": "Choose a preset size for your new template.",
        "enter_dimensions": "Enter your desired width and height in pixels.",
        "create_template_button": "Create Template",
        "width": "Width",
        "height": "Height",
        "size": "size",
        "sizes": "sizes",

        // API Integration
        "api_integration_title": "API Integration",
        "select_template": "Select Template",
        "choose_template_desc": "Choose a template to use.",
        "select_a_template_placeholder": "Select a template",
        "api_key": "API Key",
        "api_endpoint": "API Endpoint",
        "api_endpoint_desc": "Use this endpoint from n8n, Zapier, or any HTTP client",
        "endpoint_url": "Endpoint URL",
        "test_endpoint": "Test Endpoint",
        "testing": "Testing...",
        "generated_result": "Generated Result",
        "open_original_image": "Open Original Image",
        "status": "Status",
        "auth_validated": "Authentication: API Key validated",
        "method_post": "Method: POST",
        "response_processed": "Response: Processed template data",
        "image_rendering_soon": "Image Rendering: Active",
        "how_it_works": "How It Works",
        "step_1_desc": "Send a POST request to /api/render with your API key",
        "step_2_desc": "Include the templateId and optional layers data",
        "step_3_desc": "The API validates your key and fetches the template",
        "step_4_desc": "Dynamic data is merged with template elements",
        "step_5_desc": "Response includes processed template data (and image URL)",
        "code_snippets": "Code Snippets",
        "playground_json": "Playground (JSON)",
        "request_body": "Request Body",
        "reset": "Reset",
        "modify_json_hint": "Modify this JSON to test different layers and values.",
        "view_copy_json_hint": "View and copy JSON for all your templates.",
        "no_templates_found": "No templates found. Create one from the dashboard!",
        "copy_json": "Copy JSON",
        "copied": "Copied!",
        "copy_failed": "Copy Failed",
        "api_key_copied": "API Key Copied!",
        "endpoint_url_copied": "Endpoint URL Copied!",
        "api_success": "API Request Successful!",
        "api_failed": "API Request Failed",

        // Sidebar
        "home": "Home",
        "projects": "Projects",
        "templates": "Templates",
        "brand": "Brand",
        "settings": "Settings",

        // User Menu
        "log_out": "Log out",

        // Editor
        "menu_file": "File",
        "menu_open": "Open",
        "menu_open_json_desc": "Open a JSON file",
        "tool_select": "Select",
        "tool_undo": "Undo",
        "tool_redo": "Redo",
        "status_saving": "Saving...",
        "status_saved": "Saved",
        "status_failed_save": "Failed to save",
        "menu_export": "Export",
        "export_json": "JSON",
        "export_json_desc": "Save for later editing",
        "export_png": "PNG",
        "export_png_desc": "Best for sharing on the web",
        "export_jpg": "JPG",
        "export_jpg_desc": "Best for printing",
        "export_svg": "SVG",
        "export_svg_desc": "Best for editing in vector software",
        "tool_design": "Design",
        "tool_image": "Image",
        "tool_text": "Text",
        "tool_shapes": "Shapes",
        "tool_draw": "Draw",
        "tool_ai": "AI",
        "tool_settings": "Settings",
        "tool_color": "Color",
        "tool_stroke_color": "Stroke Color",
        "tool_stroke_width": "Stroke Width",
        "tool_font": "Font",
        "tool_bold": "Bold",
        "tool_italic": "Italic",
        "tool_underline": "Underline",
        "tool_strike": "Strikethrough",
        "tool_align_left": "Align Left",
        "tool_align_center": "Align Center",
        "tool_align_right": "Align Right",
        "tool_vertical_align": "Vertical Align",
        "tool_letter_spacing": "Letter Spacing",
        "tool_line_height": "Line Height",
        "tool_filters": "Filters",
        "tool_remove_bg": "Remove Background",
        "tool_bring_forward": "Bring Forward",
        "tool_send_backwards": "Send Backwards",
        "tool_opacity": "Opacity",
        "tool_duplicate": "Duplicate",
        "tool_delete": "Delete",
        "tool_reset_zoom": "Reset Zoom",
        "tool_zoom_in": "Zoom In",
        "tool_zoom_out": "Zoom Out",

        // Text Sidebar
        "sidebar_text_title": "Text",
        "sidebar_text_desc": "Add text to your canvas",
        "add_textbox": "Add a textbox",
        "add_heading": "Add a heading",
        "add_subheading": "Add a subheading",
        "add_paragraph": "Add a paragraph",

        // Image Sidebar
        "sidebar_images_title": "Images",
        "sidebar_images_desc": "Add images to your canvas",
        "upload_image": "Upload Image",
        "uploading": "Uploading...",
        "image_uploaded": "Image uploaded!",
        "image_upload_failed": "Failed to upload image",
        "image_fetch_failed": "Failed to fetch images",

        // Template Sidebar
        "sidebar_templates_title": "Templates",
        "sidebar_templates_desc": "Choose from a variety of templates to get started",
        "templates_fetch_failed": "Failed to fetch templates",
        "confirm_replace_template_title": "Are you sure?",
        "confirm_replace_template_desc": "You are about to replace the current project with this template.",

        // Filter Sidebar
        "sidebar_filters_title": "Filters",
        "sidebar_filters_desc": "Apply a filter to selected image",

        // Settings Sidebar
        "sidebar_settings_title": "Settings",
        "sidebar_settings_desc": "Change the look of your workspace",

        "resize": "Resize",

        // AI Sidebar
        "sidebar_ai_title": "AI",
        "sidebar_ai_desc": "Generate an image using AI",
        "sidebar_ai_placeholder": "An astronaut riding a horse on mars, hd, dramatic lighting",
        "generate": "Generate",

        // Draw Sidebar
        "sidebar_draw_title": "Drawing mode",
        "sidebar_draw_desc": "Modify brush settings",
        "brush_width": "Brush width",
    },
    es: {
        // Auth
        "login_title": "Iniciar sesión",
        "login_subtitle": "Usa tu correo para continuar",
        "signup_title": "Crear una cuenta",
        "signup_subtitle": "Usa tu correo para continuar",
        "email_placeholder": "Correo electrónico",
        "password_placeholder": "Contraseña",
        "fullname_placeholder": "Nombre completo",
        "continue": "Continuar",
        "dont_have_account": "¿No tienes una cuenta?",
        "already_have_account": "¿Ya tienes una cuenta?",
        "sign_up": "Regístrate",
        "sign_in": "Inicia sesión",
        "invalid_credentials": "Correo o contraseña inválidos",
        "logged_in": "Sesión iniciada exitosamente",
        "registration_successful": "¡Registro Exitoso!",
        "check_email_confirm": "Revisa tu correo para confirmar tu cuenta",
        "confirmation_email_sent": "Hemos enviado un correo de confirmación a",
        "check_inbox_activate": "Por favor revisa tu bandeja de entrada y haz clic en el enlace de confirmación para activar tu cuenta.",
        "go_to_signin": "Ir a Iniciar Sesión",

        // Dashboard
        "my_templates": "Mis Plantillas",
        "create_template": "Crear nueva plantilla",
        "search_placeholder": "Buscar plantillas...",
        "open_in_editor": "Abrir en Editor",
        "pixels": "píxeles",
        "save_preview": "Guarda para generar vista previa",
        "delete_project": "Eliminar proyecto",
        "delete_project_confirm": "¿Estás seguro que quieres eliminar este proyecto?",
        "delete": "Eliminar",
        "cancel": "Cancelar",
        "edit": "Editar",
        "copy": "Hacer una copia",
        "copy_postfix": " - Copia",
        "api_integration": "Integración API",

        // Templates Section
        "start_from_template": "Empezar con una plantilla",
        "popular": "Popular",
        "social_media": "Redes Sociales",
        "presentations": "Presentaciones",
        "documents": "Documentos",
        "business_marketing": "Negocios y Marketing",
        "print_documents": "Impresión y Documentos",
        "custom_size": "Tamaño Personalizado",
        "define_dimensions": "Definir dimensiones",
        "choose_preset": "Elige un tamaño predefinido para tu nueva plantilla.",
        "enter_dimensions": "Ingresa el ancho y alto deseado en píxeles.",
        "create_template_button": "Crear Plantilla",
        "width": "Ancho",
        "height": "Alto",
        "size": "tamaño",
        "sizes": "tamaños",

        // API Integration
        "api_integration_title": "Integración API",
        "select_template": "Seleccionar Plantilla",
        "choose_template_desc": "Elige una plantilla para usar.",
        "select_a_template_placeholder": "Selecciona una plantilla",
        "api_key": "Clave API",
        "api_endpoint": "Endpoint de API",
        "api_endpoint_desc": "Usa este endpoint desde n8n, Zapier, o cualquier cliente HTTP",
        "endpoint_url": "URL del Endpoint",
        "test_endpoint": "Probar Endpoint",
        "testing": "Probando...",
        "generated_result": "Resultado Generado",
        "open_original_image": "Abrir Imagen Original",
        "status": "Estado",
        "auth_validated": "Autenticación: Clave API validada",
        "method_post": "Método: POST",
        "response_processed": "Respuesta: Datos de plantilla procesados",
        "image_rendering_soon": "Renderizado de Imagen: Activo",
        "how_it_works": "Cómo Funciona",
        "step_1_desc": "Envía una petición POST a /api/render con tu clave API",
        "step_2_desc": "Incluye el templateId y datos opcionales de layers",
        "step_3_desc": "La API valida tu clave y obtiene la plantilla",
        "step_4_desc": "Los datos dinámicos se fusionan con los elementos",
        "step_5_desc": "La respuesta incluye datos procesados (y URL de imagen)",
        "code_snippets": "Fragmentos de Código",
        "playground_json": "Playground (JSON)",
        "request_body": "Cuerpo de la Petición",
        "reset": "Restablecer",
        "modify_json_hint": "Modifica este JSON para probar diferentes capas y valores.",
        "view_copy_json_hint": "Ver y copiar JSON para todas tus plantillas.",
        "no_templates_found": "No se encontraron plantillas. ¡Crea una desde el panel!",
        "copy_json": "Copiar JSON",
        "copied": "¡Copiado!",
        "copy_failed": "Fallo al copiar",
        "api_key_copied": "¡Clave API Copiada!",
        "endpoint_url_copied": "¡URL del Endpoint Copiada!",
        "api_success": "¡Petición API Exitosa!",
        "api_failed": "Petición API Fallida",

        // Sidebar
        "home": "Inicio",
        "projects": "Proyectos",
        "templates": "Plantillas",
        "brand": "Marca",
        "settings": "Ajustes",

        // User Menu
        "log_out": "Cerrar sesión",

        // Editor
        "menu_file": "Archivo",
        "menu_open": "Abrir",
        "menu_open_json_desc": "Abrir un archivo JSON",
        "tool_select": "Seleccionar",
        "tool_undo": "Deshacer",
        "tool_redo": "Rehacer",
        "status_saving": "Guardando...",
        "status_saved": "Guardado",
        "status_failed_save": "Error al guardar",
        "menu_export": "Exportar",
        "export_json": "JSON",
        "export_json_desc": "Guardar para editar luego",
        "export_png": "PNG",
        "export_png_desc": "Mejor para web",
        "export_jpg": "JPG",
        "export_jpg_desc": "Mejor para imprimir",
        "export_svg": "SVG",
        "export_svg_desc": "Mejor para vectores de software",
        "tool_design": "Diseño",
        "tool_image": "Imagen",
        "tool_text": "Texto",
        "tool_shapes": "Formas",
        "tool_draw": "Dibujar",
        "tool_ai": "IA",
        "tool_settings": "Ajustes",
        "tool_color": "Color",
        "tool_stroke_color": "Color Borde",
        "tool_stroke_width": "Ancho Borde",
        "tool_font": "Fuente",
        "tool_bold": "Negrita",
        "tool_italic": "Cursiva",
        "tool_underline": "Subrayado",
        "tool_strike": "Tachado",
        "tool_align_left": "Alinear Izquierda",
        "tool_align_center": "Alinear Centro",
        "tool_align_right": "Alinear Derecha",
        "tool_vertical_align": "Alinear Vertical",
        "tool_letter_spacing": "Espaciado Letras",
        "tool_line_height": "Altura Línea",
        "tool_filters": "Filtros",
        "tool_remove_bg": "Quitar Fondo",
        "tool_bring_forward": "Traer al Frente",
        "tool_send_backwards": "Enviar al Fondo",
        "tool_opacity": "Opacidad",
        "tool_duplicate": "Duplicar",
        "tool_delete": "Eliminar",
        "tool_reset_zoom": "Restablecer Zoom",
        "tool_zoom_in": "Acercar",
        "tool_zoom_out": "Alejar",

        // Text Sidebar
        "sidebar_text_title": "Texto",
        "sidebar_text_desc": "Agrega texto a tu lienzo",
        "add_textbox": "Agregar caja de texto",
        "add_heading": "Agregar título",
        "add_subheading": "Agregar subtítulo",
        "add_paragraph": "Agregar párrafo",

        // Image Sidebar
        "sidebar_images_title": "Imágenes",
        "sidebar_images_desc": "Agrega imágenes a tu lienzo",
        "upload_image": "Subir imagen",
        "uploading": "Subiendo...",
        "image_uploaded": "¡Imagen subida!",
        "image_upload_failed": "Error al subir imagen",
        "image_fetch_failed": "Error al cargar imágenes",

        // Template Sidebar
        "sidebar_templates_title": "Plantillas",
        "sidebar_templates_desc": "Elige entre una variedad de plantillas para empezar",
        "templates_fetch_failed": "Error al cargar plantillas",
        "confirm_replace_template_title": "¿Estás seguro?",
        "confirm_replace_template_desc": "Estás a punto de reemplazar el proyecto actual con esta plantilla.",

        // Filter Sidebar
        "sidebar_filters_title": "Filtros",
        "sidebar_filters_desc": "Aplica un filtro a la imagen seleccionada",

        // Settings Sidebar
        "sidebar_settings_title": "Ajustes",
        "sidebar_settings_desc": "Cambia la apariencia de tu espacio de trabajo",
        "resize": "Redimensionar",

        // AI Sidebar
        "sidebar_ai_title": "IA",
        "sidebar_ai_desc": "Genera una imagen usando IA",
        "sidebar_ai_placeholder": "Un astronauta montando a caballo en marte, hd, iluminación dramática",
        "generate": "Generar",

        // Draw Sidebar
        "sidebar_draw_title": "Modo dibujo",
        "sidebar_draw_desc": "Modifica los ajustes del pincel",
        "brush_width": "Ancho de pincel",
    }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [language, setLanguage] = useState<Language>("es"); // Default to Spanish as requested implementation implies interest

    // Load from local storage on mount
    useEffect(() => {
        const savedLang = localStorage.getItem("language") as Language;
        if (savedLang && (savedLang === "en" || savedLang === "es")) {
            setLanguage(savedLang);
        }
    }, []);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem("language", lang);
    };

    const t = (key: string) => {
        // @ts-ignore
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
};
