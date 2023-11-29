CREATE TABLE books (
    ID UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    Title VARCHAR(255) NOT NULL UNIQUE,
    Description  TEXT NOT NULL,
    Price INT NOT NULL,
    Image TEXT NOT NULL,
    UserId UUID DEFAULT uuid_generate_v4() REFERENCES users(id) ON DELETE CASCADE,
    Slug TEXT NOT NULL,
    Category TEXT NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    User_Img TEXT NOT NULL
);

ALTER TABLE books ADD COLUMN user_img TEXT NOT NULL DEFAULT 'https://res.cloudinary.com/dwdsjbetu/image/upload/v1694223269/djsplkr1hyxxtor7mogw.jpg';

