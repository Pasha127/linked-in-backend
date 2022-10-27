import PdfPrinter from "pdfmake";
import imageToBase64 from "image-to-base64";

export const getPDFReadableStream = (user) => {
  const fonts = {
    Roboto: {
      normal: "Helvetica",
      bold: "Helvetica-Bold",
    },
  };

  const printer = new PdfPrinter(fonts);

  const docDefinition = {
    content: [
     
      { text: `${user.name} ${user.surname}`, style: "header" },
      `He goes by ${user.username} and works as ${user.bio} with ${user.title} in ${user.area} he can be contacted on ${user.email}`,
    ],

    styles: {
      header: {
        fontSize: 22,
        bold: true,
      },
    },
  };

  const pdfReadableStream = printer.createPdfKitDocument(docDefinition);
  pdfReadableStream.end();

  return pdfReadableStream;
};
