from PIL import Image, ImageDraw
import os
os.makedirs('public/og', exist_ok=True)
pages = [('trading-academy.jpg','Trading Academy','Aprende a operar'), ('login.jpg','Iniciar Sesión','Accede a tu cuenta'), ('cursos.jpg','Cursos','Formación en trading'), ('dashboard.jpg','Dashboard','Métricas en tiempo real'), ('metodo.jpg','Método','Estrategias probadas'), ('bots.jpg','Bots IA','Automatización inteligente'), ('crossover.jpg','Crossover','Golden Cross Strategy'), ('testimonios.jpg','Testimonios','Opiniones de estudiantes'), ('registro.jpg','Regístrate','Crea tu cuenta hoy')]
for p in pages:
    img = Image.new('RGB', (1200, 630), color=(10, 25, 47))
    d = ImageDraw.Draw(img)
    d.text((100, 200), p[1], fill=(255, 255, 255))
    d.text((100, 350), p[2], fill=(52, 211, 153))
    img.save('public/og/' + p[0])
    print('Generado: ' + p[0])
print('Listo')
