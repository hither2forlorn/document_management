
from PIL import Image, ImageEnhance

def imageOpacitySetter(image, opacity):
    im = Image.open(image, "r")
    im1 = ReduceOpacity(im, opacity)
    im1.save(image, "PNG")

def ReduceOpacity(im, opacity):
    assert opacity >= 0 and opacity <= 1
    if im.mode != 'RGBA':
        im = im.convert('RGBA')
    else:
        im = im.copy()
    alpha = im.split()[3]
    alpha = ImageEnhance.Brightness(alpha).enhance(opacity)
    im.putalpha(alpha)
    return im

# place location of png
imageOpacitySetter('citizens.jpg', opacity=0.5) #opacity to be given here
