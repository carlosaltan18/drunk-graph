package com.uvg.drunkgraph.modules.shared;

import java.util.List;

public class PagedResult<T> {
    private final List<T> elements;
    private final long total;
    private final int page;
    private final int limit;

    public PagedResult(List<T> elements, long total, int page, int limit) {
        this.elements = elements;
        this.total = total;
        this.page = page;
        this.limit = limit;
    }

    public List<T> getElements() { return elements; }
    public long getTotal() { return total; }
    public int getPage() { return page; }
    public int getLimit() { return limit; }
}
