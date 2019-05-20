# Setup:
# apt-get install python3-venv
# python3 -m venv gensim
# source gensim/bin/activate
# pip install gensim
from gensim.models.wrappers import FastText

# Download word vector model from:
# https://dl.fbaipublicfiles.com/fasttext/vectors-crawl/cc.en.300.bin.gz
# Gunzip to a folder, and designate here
# model = FastText.load_fasttext_format('/mnt/1/cc.en.300')

# This one seems to have symbols
# https://dl.fbaipublicfiles.com/fasttext/vectors-wiki/wiki.en.zip
# unzip wiki.en.zip -x wiki.en.vec
model = FastText.load_fasttext_format('/mnt/1/wiki.en')

tags=[
	["A# .NET", 2], ["A-0 System", 2], ["A+", 2], ["A++", 2], ["ABAP", 2], ["ABC", 2],
	["ABSET", 2], ["ABSYS", 2], ["ACC", 2], ["Accent", 2], ["Ace DASL", 2], ["ACL2", 2],
	["Action!", 2], ["ActionScript", 2], ["Actor", 2], ["Ada", 2], ["Adenine", 2], ["Agda", 2],
	["Agora", 2], ["AIMMS", 2], ["Aldor", 2], ["Alef", 2], ["ALF", 2], ["ALGOL 58", 2],
	["ALGOL 68", 2], ["ALGOL W", 2], ["Alice", 2], ["Alma-0", 2], ["AmbientTalk", 2], ["Amiga E", 2],
	["AMPL", 2], ["AngelScript", 2], ["Apex", 2], ["APL", 2], ["AppleScript", 2], ["APT", 2],
	["ARexx", 2], ["Argus", 2], ["AspectJ", 2], ["Assembly language", 2], ["ATS", 2], ["Ateji PX", 2],
	["Autocoder", 2], ["AutoIt", 2], ["AutoLISP / Visual LISP", 2], ["AWK", 2], ["Axum", 2],
	["B", 2], ["Babbage", 2], ["Ballerina", 2], ["Bash", 2], ["BASIC", 2], ["bc", 2],
	["BeanShell", 2], ["Batch file", 2], ["Bertrand", 2], ["BETA", 2], ["BLISS", 2], ["Blockly", 2],
	["Boo", 2], ["Boomerang", 2], ["Bourne shell", 2], ["BPEL", 2], ["Business Basic", 2], ["C", 2],
	["C++", 2], ["C#", 2], ["C/AL", 2], ["Caché ObjectScript", 2], ["C Shell", 2],
	["Cayenne", 2], ["CDuce", 2], ["Cecil", 2], ["Céu", 2], ["Ceylon", 2],
	["Cg", 2], ["Ch", 2], ["Chapel", 2], ["Charity", 2], ["Charm", 2], ["CHILL", 2],
	["chomski", 2], ["ChucK", 2], ["Cilk", 2], ["Citrine", 2], ["CL", 2], ["Claire", 2],
	["Clean", 2], ["Clipper", 2], ["CLIPS", 2], ["CLIST", 2], ["Clojure", 2], ["CLU", 2],
	["COBOL", 2], ["CobolScript", 2], ["Cobra", 2], ["CoffeeScript", 2], ["ColdFusion", 2], ["COMAL", 2],
	["COMIT", 2], ["Common Intermediate Language", 2], ["Common Lisp", 2], ["COMPASS", 2], ["Component Pascal", 2], ["Constraint Handling Rules", 2],
	["Cool", 2], ["Coq", 2], ["Coral 66", 2], ["CorVision", 2], ["COWSEL", 2], ["CPL", 2],
	["Crystal", 2], ["Csound", 2], ["CSP", 2], ["Cuneiform", 2], ["Curl", 2], ["Curry", 2],
	["Cyclone", 2], ["Cython", 2], ["D", 2], ["DASL", 2], ["Dart", 2], ["Darwin", 2],
	["Datalog", 2], ["DATATRIEVE", 2], ["dBase", 2], ["dc", 2], ["DCL", 2], ["DinkC", 2],
	["Dog", 2], ["Draco", 2], ["DRAKON", 2], ["Dylan", 2], ["DYNAMO", 2], ["DAX", 2],
	["Ease", 2], ["Easy PL/I", 2], ["EASYTRIEVE PLUS", 2], ["eC", 2], ["ECMAScript", 2], ["Edinburgh IMP", 2],
	["Eiffel", 2], ["ELAN", 2], ["Elixir", 2], ["Elm", 2], ["Emacs Lisp", 2], ["Emerald", 2],
	["EPL", 2], ["Erlang", 2], ["es", 2], ["Escher", 2], ["ESPOL", 2], ["Esterel", 2],
	["Euclid", 2], ["Euler", 2], ["Euphoria", 2], ["EusLisp Robot Programming Language", 2], ["CMS EXEC", 2], ["EXEC 2", 2],
	["Ezhil", 2], ["F", 2], ["F#", 2], ["Factor", 2], ["Fantom", 2],
	["FFP", 2], ["Fjölnir", 2], ["FL", 2], ["Flavors", 2], ["Flex", 2], ["FlooP", 2],
	["FOCAL", 2], ["FOCUS", 2], ["FOIL", 2], ["FORMAC", 2], ["@Formula", 2], ["Forth", 2],
	["Fortress", 2], ["FoxPro", 2], ["FP", 2], ["Franz Lisp", 2], ["F-Script", 2], ["G", 2],
	["GameMonkey Script", 2], ["GAMS", 2], ["GAP", 2], ["G-code", 2], ["Genie", 2],
	["GEORGE", 2], ["GLSL", 2], ["GNU E", 2], ["Go", 2], ["Go!", 2], ["GOAL", 2],
	["Golo", 2], ["GOM", 2], ["Google Apps Script", 2], ["Gosu", 2], ["GPSS", 2],
	["GRASS", 2], ["Grasshopper", 2], ["Groovy", 2], ["H", 2], ["Hack", 2], ["HAGGIS", 2],
	["Halide", 2], ["Hamilton C shell", 2], ["Harbour", 2], ["Hartmann pipelines", 2], ["Haskell", 2], ["Haxe", 2],
	["High Level Assembly", 2], ["HLSL", 2], ["Hop", 2], ["Hopscotch", 2], ["Hope", 2],
	["Hume", 2], ["HyperTalk", 2], ["I", 2], ["Io", 2], ["Icon", 2], ["IBM Basic assembly language", 2],
	["IBM HAScript", 2], ["IBM Informix-4GL", 2], ["IBM RPG", 2], ["Irineu", 2], ["IDL", 2], ["Idris", 2],
	["J", 2], ["J#", 2], ["J++", 2], ["JADE", 2], ["JAL", 2], ["Janus", 2],
	["Java", 2], ["JavaFX Script", 2], ["JavaScript", 2], ["JCL", 2], ["JEAN", 2], ["Join Java", 2],
	["Joule", 2], ["JOVIAL", 2], ["Joy", 2], ["JScript", 2], ["JScript .NET", 2], ["JSON", 2],
	["Jython", 2], ["K", 2], ["Kaleidoscope", 2], ["Karel", 2], ["KEE", 2], ["Kixtart", 2],
	["KIF", 2], ["Kojo", 2], ["Kotlin", 2], ["KRC", 2], ["KRL", 2], ["KRYPTON", 2],
	["Kodu", 2], ["Kv", 2], ["L", 2], ["LabVIEW", 2], ["Ladder", 2], ["LANSA", 2],
	["LaTeX", 2], ["Lava", 2], ["LC-3", 2], ["LIL", 2], ["LilyPond", 2],
	["Limnor", 2], ["LINC", 2], ["Lingo", 2], ["LINQ", 2], ["LIS", 2], ["LISA", 2],
	["Lite-C", 2], ["Lithe", 2], ["Little b", 2], ["LLL", 2], ["Logo", 2], ["Logtalk", 2],
	["LPC", 2], ["LSE", 2], ["LSL", 2], ["LiveCode", 2], ["LiveScript", 2], ["Lua", 2],
	["Lustre", 2], ["LYaPAS", 2], ["Lynx", 2], ["M", 2],
	["Machine code", 2], ["MAD", 2], ["MAD/I", 2], ["Magik", 2], ["Magma", 2], ["Make", 2],
	["Maple", 2], ["MAPPER", 2], ["MARK-IV", 2], ["Mary", 2], ["MASM Microsoft Assembly x86", 2], ["MATH-MATIC", 2],
	["MATLAB", 2], ["Maxima", 2], ["Max", 2], ["MaxScript", 2], ["Maya", 2], ["MDL", 2],
	["Mesa", 2], ["Metafont", 2], ["MetaQuotes Language", 2], ["MHEG-5", 2], ["Microcode", 2], ["MicroScript", 2],
	["Milk", 2], ["MIMIC", 2], ["Mirah", 2], ["Miranda", 2], ["MIVA Script", 2], ["ML", 2],
	["Modelica", 2], ["Modula", 2], ["Mohol", 2], ["MOO", 2],
	["Mouse", 2], ["MPD", 2], ["Mathcad", 2], ["MSL", 2], ["MUMPS", 2], ["MuPAD", 2],
	["Mystic Programming Language", 2], ["N", 2], ["NASM", 2], ["Napier88", 2], ["Neko", 2], ["Nemerle", 2],
	["Net.Data", 2], ["NetLogo", 2], ["NetRexx", 2], ["NewLISP", 2], ["NEWP", 2], ["Newspeak", 2],
	["Nial", 2], ["Nice", 2], ["Nickle", 2], ["Nim", 2], ["NPL", 2], ["Not eXactly C", 2],
	["NSIS", 2], ["Nu", 2], ["NWScript", 2], ["NXT-G", 2], ["O", 2], ["o:XML", 2],
	["Oberon", 2], ["OBJ2", 2], ["Object Lisp", 2], ["Object REXX", 2], ["Object Pascal", 2],
	["Objective-J", 2], ["Obliq", 2], ["OCaml", 2], ["occam", 2], ["occam-π", 2], ["Octave", 2],
	["Onyx", 2], ["Opa", 2], ["Opal", 2], ["OpenCL", 2], ["OpenEdge ABL", 2], ["OPL", 2],
	["OptimJ", 2], ["Orc", 2], ["Oriel", 2], ["Orwell", 2],
	["Oz", 2], ["P", 2], ["ParaSail", 2], ["PARI/GP", 2],
	["PCASTL", 2], ["PCF", 2], ["PEARL", 2], ["PeopleCode", 2], ["Perl", 2], ["PDL", 2],
	["Pharo", 2], ["PHP", 2], ["Pico", 2], ["Picolisp", 2], ["Pict", 2], ["Pig", 2],
	["PIKT", 2], ["PILOT", 2], ["Pipelines", 2], ["Pizza", 2], ["PL-11", 2], ["PL/0", 2],
	["PL/C", 2], ["PL/I", 2], ["PL/M", 2], ["PL/P", 2], ["PL/SQL", 2], ["PL360", 2],
	["Plankalkül", 2], ["Planner", 2], ["PLEX", 2], ["PLEXIL", 2], ["Plus", 2], ["POP-11", 2],
	["PostScript", 2], ["PortablE", 2], ["POV-Ray SDL", 2], ["Powerhouse", 2], ["PowerBuilder", 2], ["PowerShell", 2],
	["Processing", 2], ["Processing.js", 2], ["Prograph", 2], ["PROIV", 2], ["Prolog", 2], ["PROMAL", 2],
	["PROSE modeling language", 2], ["PROTEL", 2], ["ProvideX", 2], ["Pro*C", 2], ["Pure", 2], ["PureBasic", 2],
	["Python", 2], ["Q", 2], ["Q#", 2], ["Qalb", 2], ["QtScript", 2], ["QuakeC", 2],
	["R", 2], ["R++", 2], ["Racket", 2], ["RAPID", 2], ["Rapira", 2], ["Ratfiv", 2],
	["rc", 2], ["Reason", 2], ["REBOL", 2], ["Red", 2], ["Redcode", 2], ["REFAL", 2],
	["Ring", 2], ["Rlab", 2], ["ROOP", 2], ["RPG", 2], ["RPL", 2], ["RSL", 2],
	["Ruby", 2], ["RuneScript", 2], ["Rust", 2], ["S", 2], ["S2", 2], ["S3", 2],
	["S-PLUS", 2], ["SA-C", 2], ["SabreTalk", 2], ["SAIL", 2], ["SALSA", 2], ["SAM76", 2],
	["SASL", 2], ["Sather", 2], ["Sawzall", 2], ["Scala", 2], ["Scheme", 2], ["Scilab", 2],
	["Script.NET", 2], ["Self", 2], ["SenseTalk", 2], ["SequenceL", 2],
	["SETL", 2], ["SIMPOL", 2], ["SIGNAL", 2], ["SiMPLE", 2], ["SIMSCRIPT", 2], ["Simula", 2],
	["Singularity", 2], ["SISAL", 2], ["SLIP", 2], ["SMALL", 2], ["Smalltalk", 2], ["SML", 2],
	["Snap!", 2], ["SNOBOL", 2], ["Snowball", 2], ["SOL", 2], ["Solidity", 2], 
	["Speedcode", 2], ["SPIN", 2], ["SP/k", 2], ["SPS", 2], ["SQL", 2], ["SQR", 2],
	["Squirrel", 2], ["SR", 2], ["S/SL", 2], ["Starlogo", 2], ["Strand", 2], ["Stata", 2],
	["Subtext", 2], ["SBL", 2], ["SuperCollider", 2], ["SuperTalk", 2], ["Swift", 2], ["SYMPL", 2],
	["T", 2], ["TACL", 2], ["TACPOL", 2], ["TADS", 2], ["TAL", 2], ["Tcl", 2],
	["TECO", 2], ["TELCOMP", 2], ["TeX", 2], ["TEX", 2], ["TIE", 2], ["TMG, compiler-compiler", 2],
	["TOM", 2], ["Toi", 2], ["Topspeed", 2], ["TPU", 2], ["Trac", 2], ["TTM", 2],
	["Transcript", 2], ["TTCN", 2], ["Turing", 2], ["TUTOR", 2], ["TXL", 2], ["TypeScript", 2],
	["U", 2], ["Ubercode", 2], ["UCSD Pascal", 2], ["Umple", 2], ["Unicon", 2], ["Uniface", 2],
	["Unix shell", 2], ["UnrealScript", 2], ["V", 2], ["Vala", 2], ["Verilog", 2], ["VHDL", 2],
	["Viper", 2], ["Visual Basic", 2], ["Visual Basic .NET", 2], ["Visual DataFlex", 2], ["Visual DialogScript", 2], ["Visual Fortran", 2],
	["Visual J++", 2], ["Visual J#", 2], ["Visual LISP", 2], ["Visual Objects", 2], ["Visual Prolog", 2], ["VSXu", 2],
	["WATFIV", 2], ["WebAssembly", 2], ["WebDNA", 2], ["Whiley", 2], ["Winbatch", 2], ["Wolfram Language", 2],
	["X", 2], ["X++", 2], ["X10", 2], ["xBase", 2], ["xBase++", 2], ["XBL", 2],
	["xHarbour", 2], ["XL", 2], ["Xojo", 2], ["XOTcl", 2], ["XOD", 2], ["XPath", 2],
	["XPL0", 2], ["XQuery", 2], ["XSB", 2], ["XSharp", 2], ["XSLT", 2], ["Xtend", 2],
	["Yorick", 2], ["YQL", 2], ["Yoix", 2], ["Z", 2], ["Z notation", 2], ["Zebra", 2],
	["ZetaLisp", 2], ["ZOPL", 2], ["Zsh", 2], ["ZPL", 2], ["Z++", 2],
	["Linux", 3], ["Redhat", 3], ["Debian", 3], ["Windows", 3],
	["Microsoft Excel", 4], ["Microsoft Office", 4],
	["Architecture Design", 5], ["Agile", 5], ["Project Management", 5], ["Leadership", 5], ["Waterfall", 5]
]
with open('/home/ubuntu/similarities.pgsql', 'w') as f:
    f.write('INSERT INTO tags (tag_name, tag_type_id, frequency) VALUES\n\t')
    counter = -1
    for xid, (x, xType) in enumerate(tags):
        cnt = 0
        try:
            cnt = model.wv.vocab[x.lower()].count
        except:
            pass
        if counter % 6 == 0:
            f.write(',\n\t')
            counter = 0
        if counter == -1:
            counter = 0
        if counter == 0:
            f.write('(\''+str(x)+'\', '+str(xType)+', '+str(cnt)+')')
        else:
            f.write(', (\''+str(x)+'\', '+str(xType)+', '+str(cnt)+')')
        counter += 1
    f.write(';\n\n')
    f.write('INSERT INTO tags_equality (tag_id_1, tag_id_2, similarity) VALUES\n\t')
    counter = -1
    for xid, (x, xType) in enumerate(tags):
        for yid, (y, yType) in enumerate(tags):
            try:
                if xid == yid:
                    v = 1.0
                else:
                    v = model.wv.similarity(x.lower(), y.lower())
                if v >= 0.2:
                    if counter % 6 == 0:
                        f.write(',\n\t')
                        counter = 0
                    if counter == -1:
                        counter = 0
                    if counter == 0:
                        f.write('('+str(xid+1)+', '+str(yid+1)+', '+str(v)+')')
                    else:
                        f.write(', ('+str(xid+1)+', '+str(yid+1)+', '+str(v)+')')
                    counter += 1
            except:
                pass
    f.write(';')
