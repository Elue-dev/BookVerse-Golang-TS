package helpers

import (
	"context"
	"errors"
	"fmt"
	"net/http"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/google/uuid"
)

func UploadMediaToCloud(w http.ResponseWriter, r *http.Request, field string) (string, int, error) {
	file, _, err := r.FormFile(field)

	if err != nil {
		return "", http.StatusBadRequest, fmt.Errorf("please provide %v", field)
	}
	defer file.Close()

	cld, err := cloudinary.New()
	if err != nil {
		return "", http.StatusInternalServerError, errors.New("failed to initialize Cloudinary")
	}

	var ctx = context.Background()
	randomUUID := uuid.New().String()

	uploadResult, err := cld.Upload.Upload(
		ctx,
		file,
		uploader.UploadParams{PublicID: field + randomUUID})

	if err != nil {
		return "", http.StatusInternalServerError, fmt.Errorf("failed to upload %v", field)
	}

	return uploadResult.SecureURL, http.StatusOK, nil
}
