.PHONY: all clean

EXECUTABLE_DIR := executable
EXECUTABLE := $(EXECUTABLE_DIR)/bookVerse
SOURCE_DIR := cmd/web

all: run

run: $(EXECUTABLE)
	$<

$(EXECUTABLE):
	go build -o $@ ./$(SOURCE_DIR)

clean:
	rm -rf $(EXECUTABLE_DIR)

clean-run: clean run
