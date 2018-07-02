product-flaw-detector: product-flaw-detector.cpp
	mkdir -p Release
	icc product-flaw-detector.cpp -I${MKLROOT}/include -L${MKLROOT}/lib/intel64 -lmkl_rt -lpthread -lm -ldl -o Release/product-flaw-detector
