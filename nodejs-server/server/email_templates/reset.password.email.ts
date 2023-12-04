import { formatDate } from "../helpers/date.formatter";
import { resetSuccessType } from "../types";

export const resetSuccess = ({ username }: resetSuccessType) => {
  return `
              
  <!DOCTYPE html>
  <html lang="en-US">
    <head>
      <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
      <title>Verification success</title>
      <meta name="description" content="Verification success" />
      <style type="text/css">
        a:hover {
          text-decoration: underline !important;
        }
      </style>
    </head>
  
    <body
      marginheight="0"
      topmargin="0"
      marginwidth="0"
      style="margin: 0px; background-color: #f2f3f8"
      leftmargin="0"
    >
      <!--100% body table-->
      <table
        cellspacing="0"
        border="0"
        cellpadding="0"
        width="100%"
        bgcolor="#f2f3f8"
        style="
          @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600;700&family=Lato:wght@300;400;700&family=Manrope:wght@300;400;500;600;700&family=Merriweather:wght@300;400;700&family=Montserrat:wght@200;300;400;500;600;700&family=Mukta+Vaani:wght@200;300;400;500;700&family=Nunito&family=Roboto+Slab:wght@200;300;400;500;600;700&family=Ubuntu:wght@300;400;500;700&family=Work+Sans:wght@200;300;400;500;600;700&display=swap');
          font-family: 'Poppins', sans-serif;
        "
      >
        <tr>
          <td>
            <table
              style="background-color: #f2f3f8; max-width: 670px; margin: 0 auto"
              width="100%"
              border="0"
              align="center"
              cellpadding="0"
              cellspacing="0"
            >
              <tr>
                <td style="height: 80px">&nbsp;</td>
              </tr>
              <tr>
                <td style="height: 20px">&nbsp;</td>
              </tr>
              <tr>
                <td>
                  <table
                    width="95%"
                    border="0"
                    align="center"
                    cellpadding="0"
                    cellspacing="0"
                    style="
                      max-width: 670px;
                      background: #fff;
                      border-radius: 3px;
                      text-align: center;
                      -webkit-box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.06);
                      -moz-box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.06);
                      box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.06);
                    "
                  >
                    <tr>
                      <td style="height: 40px">&nbsp;</td>
                    </tr>
                    <tr>
                      <td style="padding: 0 35px">
                        <h1
                          style="
                            color: #1e1e2d;
                            font-weight: 500;
                            margin: 0;
                            font-size: 28px;
                            font-family: 'Rubik', sans-serif;
                            text-align: left;
                          "
                        >
                          Hi, ${username}
                        </h1>
                        <span
                          style="
                            display: flex;
                            vertical-align: middle;
                            margin: 29px 0 26px;
                            border-bottom: 1px solid #cecece;
                            width: 100px;
                          "
                        ></span>
                        <span style="text-align: left">
                          <p
                            style="
                              color: #455056;
                              font-size: 15px;
                              line-height: 24px;
                              margin: 0;
                            "
                          >
                            You have successfully reset your BookVerse password.
                          </p>
                          <br />
                          <p
                            style="
                              color: #455056;
                              font-size: 15px;
                              line-height: 24px;
                              margin: 0;
                            "
                          >
                            Thank you for using our platform!
                          </p>
                        </span>
  
                        <span style="text-align: left">
                          <p>Details of this action:</p>
  
                          <p
                            style="
                              color: #455056;
                              font-size: 15px;
                              line-height: 24px;
                              margin: 0;
                            "
                          >
                            <b>Date:</b> ${formatDate(new Date())}
                          </p>
                        </span>
                        <br />
                        <span style="text-align: left; font-size: 18px">
                          <p>
                            Regards,<br />
                            BookVerse team.
                          </p>
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td style="height: 40px">&nbsp;</td>
                    </tr>
                  </table>
                </td>
              </tr>
  
              <tr>
                <td style="height: 20px">&nbsp;</td>
              </tr>
              <tr>
                <td style="text-align: center">
                  <p
                    style="
                      font-size: 14px;
                      color: rgba(69, 80, 86, 0.7411764705882353);
                      line-height: 18px;
                      margin: 0 0 0;
                    "
                  >
                  <strong> &copy; ${new Date().getFullYear()}. BookVerse Inc</strong>
                  </p>
                </td>
              </tr>
              <tr>
                <td style="height: 80px">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <!--/100% body table-->
    </body>
  </html>
  `;
};
