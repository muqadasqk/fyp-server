import path from 'path';
import ejs from 'ejs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// function to generate and return an EJS template for email body content
const getHtmlTempalate = (template, data) => {
    const templatePath = path.join(__dirname, '../../../views', `${template}.ejs`);
    return ejs.renderFile(templatePath, { data });
}

export default getHtmlTempalate; 