package handlers

import (
	"context"
	"fmt"
	"net/http"
	"strconv"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/elue-dev/bookVerse/controllers"
	"github.com/elue-dev/bookVerse/helpers"
	"github.com/elue-dev/bookVerse/models"
	"github.com/elue-dev/bookVerse/utils"
	"github.com/gorilla/mux"
)

func GetAllBooks(w http.ResponseWriter, r *http.Request) {
	result, err := controllers.GetBooks()

	if err != nil {
		helpers.SendErrorResponse(w, http.StatusInternalServerError, "Something went wrong while fetching books", err)
	}

	helpers.SendSuccessResponseWithData(w, http.StatusOK, result)
}

func AddBook(w http.ResponseWriter, r *http.Request) {
	var book models.Book

	currUser, err := helpers.GetUserFromToken(r)
	if err != nil {
		helpers.SendErrorResponse(w, http.StatusUnauthorized, "You are not authorized", err.Error())
		return
	}

	book.Title = r.FormValue("title")
	book.Description = r.FormValue("description")
	book.UserId = currUser.ID
	book.Category = r.FormValue("category")
	priceStr := r.FormValue("price")

	msg := "Please provide all required fields for this book (title, description, price, category)"

	if isValidated := helpers.ValidateBookFields(book.Title, book.Description, book.UserId, book.Category, &book.Price); !isValidated {
		helpers.SendErrorResponse(w, http.StatusBadRequest, msg, "all fields are required")
		return
	}

	price, err := strconv.Atoi(priceStr)

	if err != nil {
		helpers.SendErrorResponse(w, http.StatusInternalServerError, "Could not convert price", err.Error())
		return
	} else {
		book.Price = price
	}

	err = r.ParseMultipartForm(10 << 20)
	if err != nil {
		helpers.SendErrorResponse(w, http.StatusBadRequest, msg, err.Error())
		return
	}

	file, _, err := r.FormFile("image")
	if err != nil {
		helpers.SendErrorResponse(w, http.StatusBadRequest, "Please provide the book image", "book image was not provided in the request body")
		return
	}

	defer file.Close()

	cld, err := cloudinary.New()
	if err != nil {
		helpers.SendErrorResponse(w, http.StatusInternalServerError, "Failed to initialize Cloudinary", err.Error())
		return
	}

	var ctx = context.Background()
	uploadResult, err := cld.Upload.Upload(
		ctx,
		file,
		uploader.UploadParams{PublicID: "book image"})

	if err != nil {
		helpers.SendErrorResponse(w, http.StatusInternalServerError, "Failed to upload avatar", err.Error())
		return
	}

	book.Image = uploadResult.SecureURL

	newBook, err := controllers.CreateBook(book)

	if err != nil {
		helpers.SendErrorResponse(w, http.StatusInternalServerError, "Could not create book", err.Error())
		return
	}

	helpers.SendSuccessResponseWithData(w, http.StatusCreated, newBook)
}

func GetSingleBook(w http.ResponseWriter, r *http.Request) {
	bookId := mux.Vars(r)["id"]

	currBook, err := controllers.GetBook(bookId)

	if err != nil {
		helpers.SendErrorResponse(w, http.StatusNotFound, "Could not get book", err.Error())
		return
	}

	helpers.SendSuccessResponseWithData(w, http.StatusOK, currBook)
}

func UpdateBook(w http.ResponseWriter, r *http.Request) {
	var book models.Book
	bookId := mux.Vars(r)["id"]

	currUser, err := helpers.GetUserFromToken(r)
	if err != nil {
		helpers.SendErrorResponse(w, http.StatusUnauthorized, "You are not authorized", err.Error())
		return
	}

	currBook, err := controllers.GetBook(bookId)
	if err != nil {
		helpers.SendErrorResponse(w, http.StatusNotFound, "Could not get book", err.Error())
		return
	}

	if currUser.ID != currBook.UserId {
		helpers.SendErrorResponse(w, http.StatusForbidden, "You can only update books you added", "user id and book userId do not match")
		return
	}

	title := r.FormValue("title")
	description := r.FormValue("description")
	category := r.FormValue("category")
	priceStr := r.FormValue("price")
	imageFile, _, _ := r.FormFile("image")

	fmt.Println("title", title)
	fmt.Println("description", description)
	fmt.Println("category", category)
	fmt.Println("priceStr", priceStr)
	fmt.Println("imageFile", imageFile)

	book.Title = utils.UpdateFieldBasedOfValuePresence(title, currBook.Title).(string)
	book.Description = utils.UpdateFieldBasedOfValuePresence(description, currBook.Description).(string)
	book.Category = utils.UpdateFieldBasedOfValuePresence(category, currBook.Category).(string)

	msg := "Please provide at least one field to update (title, description, category, price, image)"

	if isValidated := helpers.ValidateBookFieldsForUpdate(title, description, category, priceStr, imageFile); !isValidated {
		helpers.SendErrorResponse(w, http.StatusBadRequest, msg, "no field was provided for an update")
		return
	}

	price, err := strconv.Atoi(priceStr)
	if err != nil {
		book.Price = currBook.Price
	} else {
		book.Price = price
	}

	file, _, err := r.FormFile("image")
	if err != nil {
		book.Image = currBook.Image
	} else {
		if file != nil {
			cld, err := cloudinary.New()
			if err != nil {
				helpers.SendErrorResponse(w, http.StatusInternalServerError, "Failed to initialize Cloudinary", err.Error())
				return
			}

			var ctx = context.Background()
			uploadResult, err := cld.Upload.Upload(
				ctx,
				file,
				uploader.UploadParams{PublicID: "book image"})

			if err != nil {
				helpers.SendErrorResponse(w, http.StatusInternalServerError, "Failed to upload avatar", err.Error())
				return
			}

			book.Image = uploadResult.SecureURL
		}

	}

	defer func() {
		if file != nil {
			file.Close()
		}
	}()

	_, err = controllers.ModifyBook(currBook.ID, book)
	if err != nil {
		helpers.SendErrorResponse(w, http.StatusInternalServerError, "Could not update book", err.Error())
		return
	}

	helpers.SendSuccessResponse(w, http.StatusOK, "Book updated successfully")
}
