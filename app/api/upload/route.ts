import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validar tipo de archivo
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Tipo de archivo no permitido. Solo imágenes (JPG, PNG, GIF, WEBP) y documentos (PDF, DOC, DOCX, TXT)' 
      }, { status: 400 });
    }

    // Validar tamaño (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'El archivo es demasiado grande. Máximo 10MB' 
      }, { status: 400 });
    }

    // Crear nombre único
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const fileName = `${timestamp}-${randomStr}-${file.name.replace(/\s/g, '-')}`;
    
    // Ruta de guardado
    const uploadDir = join(process.cwd(), 'public/uploads/chatbot');
    const filePath = join(uploadDir, fileName);

    // Asegurar que el directorio existe
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Guardar archivo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // URL pública del archivo
    const fileUrl = `/uploads/chatbot/${fileName}`;

    return NextResponse.json({ 
      success: true, 
      url: fileUrl,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Error al subir el archivo' 
    }, { status: 500 });
  }
}
