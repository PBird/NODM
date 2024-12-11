// nedb generate type definition
npx tsc datastore.js cursor.js utils.js --declaration --allowJs --emitDeclarationOnly


TODO: 
    fork @seald/nedb and make it generate type files. 
    Make cursor fields protected

    /**
     * @protected
     */
    _protectedMember = "I am protected";



Connect Database 

`

const dbPath = path.join(__dirname, "dbFiles/");

connect(`nedb://${dbPath}`, { autoload: true });


`

template reference
https://github.com/orabazu/tsup-library-template
