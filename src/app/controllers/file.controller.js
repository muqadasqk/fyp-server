import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// SERVER PRIVATELY STORED FILES
const serve = async (req, res) => {
    // file name
    const file = req.params.fileName;

    // join the file name with the directory where files are stored
    const filePath = path.join(__dirname, '../../assets/uploads', file);

    // return back with file not found if file is unavailable
    if (!fs.existsSync(filePath)) {
        return res.response(404, "The file not found", { file });
    }

    // let user download/view file
    res.download(filePath);
}

export default { serve }