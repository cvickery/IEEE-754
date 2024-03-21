
# This makefile assumes the GNU Multiprecision Library is installed where
# the linker can find it, and that the 'make' command has the usual defaults
# for building executables from C++ source code.
ifdef GMP_DIR
	GMP_INCLUDE := -I $(GMP_DIR)/include
	GMP_LIB := -L $(GMP_DIR)/lib
else
	GMP_INCLUDE :=
	GMP_LIB :=
endif

CC := g++
CXX := g++
CFLAGS := -Wall -g $(GMP_INCLUDE)
CXXFLAGS := $(CFLAGS)
LDFLAGS := $(GMP_LIB)
LDLIBS := -l gmp

all: btd dtb

install: btd dtb
	mv btd dtb ../bin

clean:
	rm -f btd dtb
	rm -fr btd.dSYM dtb.dSYM
