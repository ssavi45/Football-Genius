from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from pathlib import Path
names={400:'Regular',500:'Medium',600:'SemiBold',700:'Bold',800:'ExtraBold',900:'Black'}
for weight,name in names.items():
 font=instantiateVariableFont(TTFont('assets/fonts/Outfit.ttf'),{'wght':weight},inplace=True)
 path=Path('assets/fonts') / ('Outfit-'+name+'.ttf')
 font.save(path)
 print(path, path.stat().st_size)
