
# This makefile assumes the GNU Multiprecision Library is installed where
# the linker can find it, and that the 'make' command has the usual defaults
# for building executables from C++ source code.
CC = g++
CXX = g++
CFLAGS = -Wall -g -I ~/GMP/include
CXXFLAGS = $(CFLAGS)
LDFLAGS = -L ~/GMP/libi
LDLIBS = -l gmp

install: btd dtb
	mv btd dtb ../bin
all: btd dtb
