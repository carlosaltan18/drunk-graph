package com.uvg.drunkgraph.modules.place.service;

import com.uvg.drunkgraph.modules.place.dto.PlaceRequest;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertAll;
import static org.junit.jupiter.api.Assertions.assertThrows;

class AdminPlaceServiceImplTest {

    private final AdminPlaceServiceImpl service = new AdminPlaceServiceImpl();

    @Test
    void methodsAreMarkedAsNotImplemented() {
        PlaceRequest request = new PlaceRequest();

        assertAll(
                () -> assertThrows(UnsupportedOperationException.class,
                        () -> service.listAll(null, 0, 10)),
                () -> assertThrows(UnsupportedOperationException.class,
                        () -> service.create(request)),
                () -> assertThrows(UnsupportedOperationException.class,
                        () -> service.update("p1", request)),
                () -> assertThrows(UnsupportedOperationException.class,
                        () -> service.softDelete("p1"))
        );
    }
}
