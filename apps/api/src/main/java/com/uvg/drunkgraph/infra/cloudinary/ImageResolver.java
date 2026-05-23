package com.uvg.drunkgraph.infra.cloudinary;

import java.util.List;

public interface ImageResolver {
    List<String> resolve(List<String> publicIds);
}
