.PHONY: all clean

EXECUTABLE_DIR := executable
EXECUTABLE := $(EXECUTABLE_DIR)/BookVerse-Golang-TS
SOURCE_DIR := .

all: run

run: $(EXECUTABLE)
	$<

$(EXECUTABLE):
	go build -o $@ ./$(SOURCE_DIR)

clean:
	rm -rf $(EXECUTABLE_DIR)

clean-run: clean run
